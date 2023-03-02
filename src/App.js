import React, {
  useState,
  memo,
  useRef,
  forwardRef,
  useMemo,
  useCallback,
  useImperativeHandle,
} from "react";
import {
  Editor,
  EditorState,
  RichUtils,
  ContentBlock,
  convertToRaw,
  ContentState,
  CharacterMetadata,
} from "draft-js";
import "draft-js/dist/Draft.css";
import { List } from "immutable";
import _ from "lodash";
import ProblemLeftEditor from "./Components/Editor";
import ProblemViewer from "./Components/Viewer";
import { Row, WhiteSpace, Col } from "./styles/globalStyled";
import { TextField, Button } from "@material-ui/core";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import useAPI from "./hooks/useAPI";
console.warn = () => {};
function App() {
  const [meta, setMeta] = useState([]);
  const [testId, setTestId] = useState("0");
  const [testName, setTestName] = useState("0");
  const [canUpload, setCanUpload] = useState(false);
  const [API] = useMemo(useAPI, []);
  const scrollRef = useRef({});
  // const editorStateRef = useRef([]);

  const textParser = (text, inlineStyleRanges) => {
    let result = text || "";
    // insert <u> , </u> to UNDERLINE
    console.log(text, inlineStyleRanges);
    let offset = 0;
    inlineStyleRanges.map((v) => {
      if (v.style !== "UNDERLINE") return;
      console.log(result);
      result =
        result.slice(0, v.offset + offset) +
        " <u> " +
        result.slice(v.offset + offset);
      // result.splice(v.offset + offset, 0, " <u> ");
      offset = offset + 5;
      // console.log(result);
      result =
        result.slice(0, v.offset + v.length + offset) +
        " </u> " +
        result.slice(v.offset + v.length + offset);
      //
      //
      // result.splice(v.offset + v.length + offset, 0, " </u> ");
      offset = offset + 6;
    });
    return result;
  };

  const setProblems = useCallback((problems, idx) => {
    setMeta((prev) => {
      const temp = _.cloneDeep(prev);
      temp[idx].problems = problems;
      return temp;
    });
  }, []);

  const onDeleteText = useCallback((idx) => {
    if (
      window.confirm(
        "정말 지문을 삭제할까요?\n 지문에 포함된 문제도 함께 삭제됩니다."
      )
    ) {
      setMeta((prev) => {
        const temp = _.cloneDeep(prev);
        temp.splice(idx, 1);
        return temp;
      });
    }
  }, []);

  return (
    <div
      className="App"
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Row style={{ height: "auto" }}>
        <TextField
          value={testId}
          onChange={(e) => {
            setTestId(e.target.value);
            setCanUpload(false);
            setTestName("");
          }}
        />
        <Button
          style={{ alignSelf: "center" }}
          variant="contained"
          color="primary"
          onClick={async () => {
            try {
              const params = {
                id: testId,
              };
              const { data } = await API.api.getexam(params);
              console.log(data.output);
              setTestName(data.output?.school);
              alert(data.output?.school);
              setCanUpload(true);
            } catch (e) {
            } finally {
            }
          }}
        >
          시험지 정보 조회
        </Button>
        <Button
          style={{ alignSelf: "center" }}
          variant="contained"
          color="primary"
          onClick={async () => {
            try {
              if (!canUpload) {
                alert("시험지 정보를 조회해주세요.");
                return;
              }
              // totalCount
              const totalCount = meta.reduce((acc, cur) => {
                return acc + cur.problems.length;
              }, 0);
              if (window.confirm(`${totalCount}문제를 업로드 하시겠습니까?`)) {
                // s1, s2, s3, s4, s5, answer should not be empty
                const emptyCheck = meta.reduce((acc, cur) => {
                  return (
                    acc &&
                    cur.problems.reduce((acc2, cur2) => {
                      return (
                        acc2 &&
                        ((cur2.s1 !== "" &&
                          cur2.s2 !== "" &&
                          cur2.s3 !== "" &&
                          cur2.s4 !== "" &&
                          cur2.s5 !== "") ||
                          cur.type === "서술형") &&
                        cur2.answer !== ""
                      );
                    }, true)
                  );
                }, true);
                console.log(emptyCheck);
                if (!emptyCheck) {
                  alert("모든 문제의 선택지와 정답을 입력해주세요.");
                  return;
                }
                const revisedMeta = meta.map((v, idx) => {
                  return {
                    ...v,
                    editorState: scrollRef.current[idx].getEditorState(),
                  };
                });
                const result = revisedMeta.map((v) => {
                  return {
                    text: [
                      {
                        text: convertToRaw(v.editorState.getCurrentContent())
                          .blocks.map((k) => {
                            return textParser(k.text, k.inlineStyleRanges);
                          })
                          .join(" <nl/> "),
                        type: "text",
                      },
                    ],
                    problems: v.problems,
                  };
                });
                const params = {
                  body: {
                    test_array: result,
                    meta_id: testId,
                  },
                };
                const { data } = await API.api.insertexamkorea(params);
                alert("업로드를 완료했습니다. 작업창을 초기화합니다.");
                setMeta([]);
                console.log(data);
              }
            } catch (e) {
              console.log(e);
            } finally {
            }
          }}
        >
          업로드
        </Button>
        {testName}
      </Row>
      {meta.map((v, idx) => {
        return (
          <ProblemWidthText
            key={idx}
            textIndex={idx}
            ref={(v) => {
              scrollRef.current[idx] = v;
            }}
            problems={v.problems}
            setProblems={setProblems}
            startNumber={
              meta.slice(0, idx).reduce((acc, cur) => {
                return acc + cur.problems.length;
              }, 0) + 1
            }
            onDeleteText={onDeleteText}
          />
        );
      })}
      <Button
        style={{ alignSelf: "center" }}
        variant="contained"
        color="primary"
        onClick={() => {
          setMeta([
            ...meta,
            {
              problems: [
                {
                  problem_array: [
                    {
                      text: "",
                      type: "text",
                      align: "flex-start",
                      title: "",
                      border: false,
                    },
                  ],
                  s1: "",
                  s2: "",
                  s3: "",
                  s4: "",
                  s5: "",
                  type: "객관식",
                  answer: "",
                  helpAns: "",
                },
              ],
              // editorState: EditorState.createEmpty(),
            },
          ]);
        }}
      >
        새로운 지문
      </Button>
      <div
        style={{
          width: 120,
          height: 200,
          backgroundColor: "white",
          position: "fixed",
          bottom: 30,
          right: 30,
          borderWidth: 10,
          border: "1px solid black",
          padding: 8,
          overflowY: "scroll",
        }}
      >
        {meta.map((v, idx) => {
          const startNumber =
            meta.slice(0, idx).reduce((acc, cur) => {
              return acc + cur.problems.length;
            }, 0) + 1;
          return (
            <div>
              <div>지문{idx + 1}</div>
              <div style={{ marginLeft: 5 }}>
                {v.problems.map((v, index) => {
                  return (
                    <h6
                      style={{
                        marginTop: 4,
                        marginBottom: 4,
                        cursor: "pointer",
                      }}
                      onMouseDown={() => {
                        scrollRef?.current?.[idx]?.scrollToIndex(index);
                        // console.log(scrollRef.current);
                      }}
                    >
                      {index + startNumber}번 문제
                    </h6>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;

const ProblemWidthText = memo(
  forwardRef(
    ({ problems, setProblems, startNumber, textIndex, onDeleteText }, ref) => {
      const [editorState, setEditorState] = useState(EditorState.createEmpty());
      const scrollRef = useRef([]);
      useImperativeHandle(ref, () => ({
        getEditorState: () => {
          return editorState;
        },
        scrollToIndex: (index) => {
          scrollRef.current?.[index].scrollIntoView({
            behavior: "smooth",
          });
        },
      }));
      return (
        <div
          style={{
            width: 1650,
            height: "auto",
            display: "flex",
            flexDirection: "row",
            borderBottom: "1px solid #5471FF",
            marginBottom: 50,
            paddingBottom: 50,
            position: "relative",
          }}
          ref={(refer) => {
            if (refer) {
              console.log("refer", refer);
              console.log("ref", ref);
              if (!ref.current) {
                ref.current = {};
              }
              if (!ref.current?.editorState) {
                ref.current.editorState = {};
              }
              ref.current.editorState[textIndex] = refer;
            }
          }}
        >
          <TextEditor
            width={500}
            editorState={editorState}
            setEditorState={(e) => {
              setEditorState(e, textIndex);
            }}
            onDeleteText={() => {
              onDeleteText(textIndex);
            }}
          />
          <div
            style={{
              height: "100%",
              marginRight: 24,
              marginLeft: 24,
              borderRight: "1px solid #5471FF",
              width: 100,
              display: "flex",
              position: "absolute",
              left: 400,
            }}
          />
          <div
            style={{
              height: "100%",
              width: 100,
              display: "flex",
            }}
          />
          <Col style={{ width: 1100 }}>
            {problems.map((v, i) => {
              return (
                <ProblemEditor
                  ref={(refer) => {
                    scrollRef.current[i] = refer;
                  }}
                  number={startNumber + i}
                  problem_array={v.problem_array}
                  setProblem_array={(problem_array) => {
                    const temp = _.cloneDeep(problems);
                    temp[i].problem_array = problem_array(v.problem_array);
                    setProblems(temp, textIndex);
                  }}
                  s1={v.s1}
                  s2={v.s2}
                  s3={v.s3}
                  s4={v.s4}
                  s5={v.s5}
                  type={v.type}
                  setType={(type) => {
                    const temp = _.cloneDeep(problems);
                    temp[i].type = type;
                    setProblems(temp, textIndex);
                  }}
                  setS1={(s1) => {
                    const temp = _.cloneDeep(problems);
                    temp[i].s1 = s1;
                    setProblems(temp, textIndex);
                  }}
                  setS2={(s2) => {
                    const temp = _.cloneDeep(problems);
                    temp[i].s2 = s2;
                    setProblems(temp, textIndex);
                  }}
                  setS3={(s3) => {
                    const temp = _.cloneDeep(problems);
                    temp[i].s3 = s3;
                    setProblems(temp, textIndex);
                  }}
                  setS4={(s4) => {
                    const temp = _.cloneDeep(problems);
                    temp[i].s4 = s4;
                    setProblems(temp, textIndex);
                  }}
                  setS5={(s5) => {
                    const temp = _.cloneDeep(problems);
                    temp[i].s5 = s5;
                    setProblems(temp, textIndex);
                  }}
                  answer={v.answer}
                  setAnswer={(answer) => {
                    const temp = _.cloneDeep(problems);
                    temp[i].answer = answer;
                    setProblems(temp, textIndex);
                  }}
                  helpAns={v.helpAns}
                  setHelpAns={(helpAns) => {
                    const temp = _.cloneDeep(problems);
                    temp[i].helpAns = helpAns;
                    setProblems(temp, textIndex);
                  }}
                  key={i}
                  setSelect={(select) => {
                    const temp = _.cloneDeep(problems);
                    temp[i].s1 = select.s1;
                    temp[i].s2 = select.s2;
                    temp[i].s3 = select.s3;
                    temp[i].s4 = select.s4;
                    temp[i].s5 = select.s5;
                    setProblems(temp, textIndex);
                  }}
                  onDeleteProblem={() => {
                    if (window.confirm("정말 삭제하시겠습니까?")) {
                      const temp = _.cloneDeep(problems);
                      temp.splice(i, 1);
                      setProblems(temp, textIndex);
                    }
                  }}
                  onMoveUp={() => {
                    if (i === 0) return;
                    const temp = _.cloneDeep(problems);
                    const temp2 = temp[i];
                    temp[i] = temp[i - 1];
                    temp[i - 1] = temp2;
                    setProblems(temp, textIndex);
                  }}
                  onMoveDown={() => {
                    if (i === problems.length - 1) return;
                    const temp = _.cloneDeep(problems);
                    const temp2 = temp[i];
                    temp[i] = temp[i + 1];
                    temp[i + 1] = temp2;
                    setProblems(temp, textIndex);
                  }}
                />
              );
            })}
            <Button
              style={{ alignSelf: "center" }}
              variant="contained"
              color="primary"
              onClick={() => {
                setProblems(
                  [
                    ...problems,
                    {
                      problem_array: [
                        {
                          text: "",
                          type: "text",
                          align: "flex-start",
                          title: "",
                          border: false,
                        },
                      ],
                      s1: "",
                      s2: "",
                      s3: "",
                      s4: "",
                      s5: "",
                      answer: "",
                      helpAns: "",
                      type: "객관식",
                    },
                  ],
                  textIndex
                );
              }}
            >
              새로운 문제
            </Button>
          </Col>
        </div>
      );
    }
  ),
  (prevState, nextProps) => {
    // // prolbme, editorState 비교
    // for (const index in nextProps) {
    //   if (nextProps[index] !== prevState[index]) {
    //     console.log(index, prevState[index], "-->", nextProps[index]);
    //   }
    // }
    return false;
    return (
      _.isEqual(prevState.problems, nextProps.problems) &&
      _.isEqual(prevState.editorState, nextProps.editorState)
    );
  }
);
const TextEditor = ({ width, editorState, setEditorState, onDeleteText }) => {
  const insertText = () => {
    const temp = convertToRaw(editorState.getCurrentContent()).blocks;
    const contentState = ContentState.createFromBlockArray(
      temp.map((v) => {
        const boldArray = [];
        v.inlineStyleRanges.forEach((v) => {
          if (v.style === "BOLD") {
            for (let i = v.offset; i < v.offset + v.length; i++) {
              boldArray.push(i);
            }
          } else if (v.style === "UNDERLINE") {
            for (let i = v.offset; i < v.offset + v.length; i++) {
              boldArray.push(i);
            }
          }
        });
        return new ContentBlock({
          key: v.key,
          type: v.type,
          text: v.text,
          characterList: List(
            v.text.split("").map((v, i) => {
              return new CharacterMetadata.applyStyle(
                new CharacterMetadata(),
                boldArray.includes(i) ? "UNDERLINE" : ""
              );
            })
          ),
        });
      })
    );
    setEditorState(
      EditorState.push(editorState, contentState, "insert-characters")
    );
  };
  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };
  const handleTogggleClick = (e, inlineStyle) => {
    e.preventDefault();
    setEditorState(RichUtils.toggleInlineStyle(editorState, inlineStyle));
  };
  return (
    <div
      style={{
        backgroundColor: "#fafefa",
      }}
    >
      <Button
        variant="contained"
        onMouseDown={(e) => {
          handleTogggleClick(e, "UNDERLINE");
        }}
      >
        밑줄
      </Button>
      <Button variant="contained" onClick={insertText}>
        볼드 -> 밑줄
      </Button>
      <Button variant="contained" onClick={onDeleteText}>
        지문 삭제
      </Button>
      <div style={{ width: width, border: "1px solid red" }}>
        <Editor
          // keyBindingFn={keyBindingFn}
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
        />
      </div>
    </div>
  );
};

const ProblemEditor = memo(
  forwardRef(
    (
      {
        problem_array,
        setProblem_array,
        s1,
        s2,
        s3,
        s4,
        s5,
        type,
        setType,
        setS1,
        setS2,
        setS3,
        setS4,
        setS5,
        answer,
        setAnswer,
        helpAns,
        setHelpAns,
        setSelect,
        onDeleteProblem,
        onMoveUp,
        onMoveDown,
        number,
      },
      ref
    ) => {
      return (
        <div
          ref={ref}
          style={{
            width: 1100,
            display: "flex",
            flexDirection: "row",
            backgroundColor: "#fefafa",
            borderBottom: "1px solid #5471ff",
            marginBottom: 20,
            paddingBottom: 20,
          }}
        >
          <Col style={{ height: "auto", justifyContent: "flex-start" }}>
            <ProblemLeftEditor
              array={problem_array}
              setArray={setProblem_array}
            />
            <Button
              variant="contained"
              onClick={() => {
                const temp = window.prompt("선지를 입력하세요.");
                if (temp) {
                  const temp2 = temp.split("⑤");
                  const temp3 = temp2[0].split("④");
                  const temp4 = temp3[0].split("③");
                  const temp5 = temp4[0].split("②");
                  const temp6 = temp5[0].split("①");
                  setSelect({
                    s1: temp6[1]?.trim() || "",
                    s2: temp5[1]?.trim() || "",
                    s3: temp4[1]?.trim() || "",
                    s4: temp3[1]?.trim() || "",
                    s5: temp2[1]?.trim() || "",
                  });
                }
              }}
            >
              선지 입력
            </Button>
            {[
              { value: s1, setValue: setS1 },
              { value: s2, setValue: setS2 },
              { value: s3, setValue: setS3 },
              { value: s4, setValue: setS4 },
              { value: s5, setValue: setS5 },
            ].map((v, idx) => {
              return (
                <Row
                  key={"선지입력" + idx}
                  style={{ height: 60, justifyContent: "flex-start" }}
                >
                  {idx + 1} 번
                  <TextField
                    value={v.value}
                    onChange={(e) => {
                      v.setValue(e.target.value);
                    }}
                    style={{ flex: 1 }}
                  />
                  <WhiteSpace />
                </Row>
              );
            })}
          </Col>
          <Col style={{ height: "auto", justifyContent: "flex-start" }}>
            {number}번 문제
            <Row style={{ height: "auto", justifyContent: "flex-start" }}>
              <Button variant="contained" onClick={onDeleteProblem}>
                문제 삭제
              </Button>
              <Button variant="contained" onClick={onMoveUp}>
                <FaArrowUp />
              </Button>
              <Button variant="contained" onClick={onMoveDown}>
                <FaArrowDown />
              </Button>
            </Row>
            <ProblemViewer array={problem_array} width={600} />
            {/* selectType 객관식 | 서술형 */}
            <Row style={{ height: "auto", justifyContent: "flex-start" }}>
              <Button
                variant={type === "객관식" ? "contained" : "text"}
                onClick={() => {
                  setType("객관식");
                }}
              >
                객관식
              </Button>
              <Button
                variant={type === "서술형" ? "contained" : "text"}
                onClick={() => {
                  setType("서술형");
                }}
              >
                서술형
              </Button>
            </Row>
            {[
              { value: answer, setValue: setAnswer },
              { value: helpAns, setValue: setHelpAns },
            ].map((v, idx) => {
              return (
                <Row
                  key={"정답입력" + idx}
                  style={{ height: "auto", justifyContent: "flex-start" }}
                >
                  {["정답", "해설"][idx]}
                  <TextField
                    value={v.value}
                    onChange={(e) => {
                      v.setValue(e.target.value);
                    }}
                    style={{ flex: 1 }}
                    multiline={Boolean(idx)}
                  />
                  <WhiteSpace />
                </Row>
              );
            })}
          </Col>
        </div>
      );
    }
  )
  // (prevState, nextProps) => {
  //   for (const index in nextProps) {
  //     if (nextProps[index] !== prevState[index]) {
  //       console.log(index, prevState[index], "-->", nextProps[index]);
  //     }
  //   }
  // }
);

import { Button, TextareaAutosize, TextField } from "@material-ui/core";
import React, { memo, useRef, useMemo } from "react";
import {
  FaAlignCenter,
  FaAlignLeft,
  FaAlignRight,
  FaArrowDown,
  FaArrowUp,
  FaBorderStyle,
  FaTrash,
  FaUpload,
  FaArrowsAltV,
} from "react-icons/fa";
import { TbMathFunction } from "react-icons/tb";
import { MdOutlineFormatColorText } from "react-icons/md";
import { Col, Row } from "../styles/globalStyled";
import DraggableList from "react-draggable-list";
import useMathpix from "../hooks/useMathpix";
import { FileDrop } from "react-file-drop";
import AWS from "aws-sdk";
import { toast } from "react-toastify";
const access_key = "A9FF589F2782025253D5";
const secret_key = "7C478C316E7A1959070096DDE90CD6FFC836AB3E";
AWS.config.update({
  accessKeyId: access_key,
  secretAccessKey: secret_key,
  region: "kr-standard",
  endpoint: "https://kr.object.ncloudstorage.com",
});
const MathBox = memo(
  ({
    text,
    setText,
    moveUp,
    moveDown,
    onDelete,
    setBorder,
    setTitle,
    title,
    dragHandleProps,
    dragged,
    change,
  }) => {
    const [MATH_API] = useMemo(useMathpix, []);
    const onDrop = async (file, event) => {
      toast.info("수식 업로드 시작");
      if (file.length !== 1) {
        toast.error("이미지는 하나만 올려주세요");
        return;
      }
      const targetFile = file[0];
      const s3 = new AWS.S3();
      const extension = targetFile.name.split(".").pop();
      const name = "001" + new Date().getTime();
      const upParams = {
        ACL: "public-read",
        Bucket: "exam-image" /* required */,
        Body: targetFile,
        Key: "drag" + "-" + name + "." + extension,
      };

      const url = await s3
        .upload(upParams, function (err, data) {
          if (err) {
            throw err;
          }
        })
        .promise()
        .then((v) => {
          console.log(v);
          return (
            `https://kr.object.ncloudstorage.com/exam-image/` + upParams.Key
          );
        })
        .catch((e) => {
          console.log(e);
        });
      toast.info("수식 업로드 완료, 수식 추출 시작");
      const params = {
        body: {
          src: url,
          formats: ["text"],
          data_options: {
            include_asciimath: true,
          },
        },
      };
      const { data } = await MATH_API.api.convertImgToTxt(params);
      if (data.text) {
        toast.info("수식 추출 완료");
        console.log("data.data");
        console.log(data.data);
        console.log(data.text);
        console.log(data.html);
        setText(data.text || text);
      } else {
        toast.error("수식 추출 실패");
      }
    };
    const onToText = () => {
      if (!window.confirm("수식을 텍스트로 변환하시겠습니까?")) return;
      change({
        type: "text",
        text: text,
        title: title,
        align: "flex-start",
      });
    };
    return (
      <Row
        style={{
          height: "auto",
          justifyContent: "flex-start",
          alignItems: "center",
          border: "1px solid #dbdcdc",
          marginBottom: 10,
          width: 500,
          backgroundColor: dragged ? "red" : "rgba(231, 243, 248, 1)",
          right: dragged ? -400 : 0,
          position: dragged ? "absolute" : "relative",
        }}
      >
        <div
          className="dragHandle"
          style={{
            width: 30,
            height: 30,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          {...dragHandleProps}
        >
          <FaArrowsAltV size={30} />
        </div>
        <FileDrop onDrop={onDrop} style={{ width: 770, height: 160 }}>
          <Row>
            <TextareaAutosize
              id="standard-basic"
              label="수식"
              variant="standard"
              value={text}
              style={{ marginRight: 20, width: 500 }}
              onChange={(event) => {
                setText(event.target.value);
              }}
            />
            <Col style={{ width: 260, justifyContent: "flex-start" }}>
              <Row style={{ height: 30, justifyContent: "flex-start" }}>
                <Button variant="contained" color="primary" onClick={moveUp}>
                  <FaArrowUp />
                </Button>
                <Button variant="contained" color="primary" onClick={moveDown}>
                  <FaArrowDown />
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={onDelete}
                >
                  <FaTrash />
                </Button>
              </Row>
              <Row style={{ height: 30, justifyContent: "flex-start" }}>
                <Button variant="contained" color="primary" onClick={onToText}>
                  <MdOutlineFormatColorText />
                </Button>
                <Button variant="contained" color="primary" onClick={setBorder}>
                  <FaBorderStyle />
                </Button>
              </Row>
              <TextField
                id="standard-basic"
                label="제목"
                variant="standard"
                value={title}
                style={{ marginRight: 20, flex: 1 }}
                onChange={(event) => {
                  setTitle(event.target.value);
                }}
              />
            </Col>
          </Row>
        </FileDrop>
      </Row>
    );
  }
);

MathBox.displayName = "TextBox";

const TextBox = memo(
  ({
    text,
    setText,
    moveUp,
    moveDown,
    onDelete,
    setAlign, // one of left, center, right
    setBorder,
    setTitle,
    title,
    dragHandleProps,
    dragged,
    change,
  }) => {
    const onToMath = () => {
      if (!window.confirm("텍스트를 수식으로 변환하시겠습니까?")) return;
      change({
        type: "math",
        math: text,
        title: title,
      });
    };
    return (
      <Row
        style={{
          height: "auto",
          justifyContent: "flex-start",
          alignItems: "center",
          border: "1px solid #dbdcdc",
          marginBottom: 10,
          width: 500,
          backgroundColor: dragged ? "red" : "rgba(244, 240, 247, 0.8)",
          right: dragged ? -400 : 0,
          position: dragged ? "absolute" : "relative",
        }}
      >
        <div
          className="dragHandle"
          style={{
            width: 30,
            height: 30,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          {...dragHandleProps}
        >
          <FaArrowsAltV size={30} />
        </div>
        <TextareaAutosize
          id="standard-basic"
          label="텍스트"
          variant="standard"
          value={text}
          style={{ marginRight: 20, flex: 1 }}
          onChange={(event) => {
            setText(event.target.value);
          }}
        />
        <Col style={{ width: 260 }}>
          <Row style={{ height: 30, justifyContent: "flex-start" }}>
            <Button variant="contained" color="primary" onClick={moveUp}>
              <FaArrowUp />
            </Button>
            <Button variant="contained" color="primary" onClick={moveDown}>
              <FaArrowDown />
            </Button>
            <Button variant="contained" color="primary" onClick={onToMath}>
              <TbMathFunction />
            </Button>
            <Button variant="contained" color="secondary" onClick={onDelete}>
              <FaTrash />
            </Button>
          </Row>
          <Row style={{ height: 30, justifyContent: "flex-start" }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setAlign("flex-start");
              }}
            >
              <FaAlignLeft />
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setAlign("center");
              }}
            >
              <FaAlignCenter />
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                setAlign("flex-end");
              }}
            >
              <FaAlignRight />
            </Button>
            <Button variant="contained" color="primary" onClick={setBorder}>
              <FaBorderStyle />
            </Button>
          </Row>
          <TextField
            id="standard-basic"
            label="제목"
            variant="standard"
            value={title}
            style={{ marginRight: 20, flex: 1 }}
            onChange={(event) => {
              setTitle(event.target.value);
            }}
          />
        </Col>
      </Row>
    );
  }
);
TextBox.displayName = "TextBox";

const ImageBox = memo(
  ({
    url,
    setUrl,
    moveUp,
    moveDown,
    onDelete,
    dragHandleProps,
    dragged,
    change,
  }) => {
    const fileRef = useRef(null);
    const [MATH_API] = useMemo(useMathpix, []);
    const onDrop = async (file, event) => {
      if (file.length !== 1) {
        alert("이미지는 하나만 올려주세요");
        return;
      }
      const targetFile = file[0];
      const s3 = new AWS.S3();
      const extension = targetFile.name.split(".").pop();
      const name = "001" + new Date().getTime();
      const upParams = {
        ACL: "public-read",
        Bucket: "exam-image" /* required */,
        Body: targetFile,
        Key: "drag" + "-" + name + "." + extension,
      };

      const url = await s3
        .upload(upParams, function (err, data) {
          if (err) {
            throw err;
          }
        })
        .promise()
        .then((v) => {
          console.log(v);
          return (
            `https://kr.object.ncloudstorage.com/exam-image/` + upParams.Key
          );
        })
        .catch((e) => {
          console.log(e);
        });
      setUrl(url);
    };

    const onToMath = async () => {
      try {
        if (!window.confirm("수식으로 변환하시겠습니까?")) return;
        const params = {
          body: {
            src: url,
            formats: ["text"],
            data_options: {
              include_asciimath: true,
            },
          },
        };
        const { data } = await MATH_API.api.convertImgToTxt(params);
        if (data.text) {
          toast.info("수식 추출 완료");
          change({
            type: "math",
            math: data.text || "",
          });
        } else {
          toast.error("수식 추출 실패");
        }
      } catch (e) {
        console.log(e);
      } finally {
      }
    };

    return (
      <Row
        style={{
          height: 160,
          justifyContent: "flex-start",
          alignItems: "center",
          border: "1px solid #dbdcdc",
          marginBottom: 10,
          backgroundColor: dragged ? "red" : "rgba(253, 235, 236, 1)",
          right: dragged ? -400 : 0,
          position: dragged ? "absolute" : "relative",
        }}
      >
        <div
          className="dragHandle"
          style={{
            width: 30,
            height: 30,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          {...dragHandleProps}
        >
          <FaArrowsAltV size={30} />
        </div>
        <FileDrop onDrop={onDrop} style={{ width: 770 }}>
          <Row style={{ width: 770, height: 160 }}>
            <TextField
              id="standard-basic"
              label="이미지"
              variant="standard"
              value={url}
              style={{ marginRight: 20, flex: 1 }}
              onChange={(event) => {
                setUrl(event.target.value);
              }}
            />
            <Col style={{ width: 260, justifyContent: "center" }}>
              <Row style={{ height: 30, justifyContent: "flex-start" }}>
                <Button variant="contained" color="primary" onClick={moveUp}>
                  <FaArrowUp />
                </Button>
                <Button variant="contained" color="primary" onClick={moveDown}>
                  <FaArrowDown />
                </Button>
                <Button variant="contained" color="primary" onClick={onToMath}>
                  <TbMathFunction />
                </Button>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={onDelete}
                >
                  <FaTrash />
                </Button>
              </Row>
            </Col>
          </Row>
        </FileDrop>
      </Row>
    );
  }
);
ImageBox.displayName = "ImageBox";

const WhiteSpaceBox = memo(
  ({
    lineHeight,
    setLineHeight,
    moveUp,
    moveDown,
    onDelete,
    dragHandleProps,
    dragged,
  }) => {
    return (
      <Row
        style={{
          height: 160,
          justifyContent: "flex-start",
          alignItems: "center",
          border: "1px solid #dbdcdc",
          marginBottom: 10,
          dragHandleProps,
          backgroundColor: dragged ? "red" : "white",
          //   left: dragged ? -400 : 0,
          position: dragged ? "absolute" : "relative",
        }}
      >
        <div
          className="dragHandle"
          style={{
            width: 30,
            height: 30,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          {...dragHandleProps}
        >
          <FaArrowsAltV size={30} />
        </div>
        <TextField
          id="standard-basic"
          label="간격"
          variant="standard"
          value={lineHeight}
          type="number"
          style={{ marginRight: 20, flex: 1 }}
          onChange={(event) => {
            setLineHeight(Number(event.target.value));
          }}
        />
        <Col style={{ width: 260, justifyContent: "flex-start" }}>
          <Row style={{ height: 30, justifyContent: "flex-start" }}>
            <Button variant="contained" color="primary" onClick={moveUp}>
              <FaArrowUp />
            </Button>
            <Button variant="contained" color="primary" onClick={moveDown}>
              <FaArrowDown />
            </Button>
            <Button variant="contained" color="secondary" onClick={onDelete}>
              <FaTrash />
            </Button>
          </Row>
        </Col>
      </Row>
    );
  }
);
WhiteSpaceBox.displayName = "WhiteSpaceBox";

const EditItem = memo(
  ({ item, itemSelected, dragHandleProps }) => {
    const dragged = itemSelected !== 0;
    // console.log("render!");
    const {
      type,
      text,
      url,
      math,
      title,
      id,
      setProblem_array,
      lineHeight = 1,
    } = item;

    const onUp = () => {
      setProblem_array((prev) => {
        const idx = prev.findIndex((v) => v.id === item.id);
        const temp = JSON.parse(JSON.stringify(prev));
        if (idx === 0) {
          return temp;
        }
        const temp2 = temp[idx];
        temp[idx] = temp[idx - 1];
        temp[idx - 1] = temp2;
        return temp;
      });
    };
    const onDown = () => {
      setProblem_array((prev) => {
        const idx = prev.findIndex((v) => v.id === item.id);
        const temp = JSON.parse(JSON.stringify(prev));
        if (idx === prev.length - 1) {
        } else {
          const temp2 = temp[idx];
          temp[idx] = temp[idx + 1];
          temp[idx + 1] = temp2;
          return temp;
        }
      });
    };
    const onDelete = () => {
      setProblem_array((prev) => {
        const idx = prev.findIndex((v) => v.id === item.id);
        const temp = JSON.parse(JSON.stringify(prev));
        temp.splice(idx, 1);
        return temp;
      });
    };

    if (type === "math") {
      const setText = (text) => {
        setProblem_array((prev) => {
          const idx = prev.findIndex((v) => v.id === item.id);
          const temp = JSON.parse(JSON.stringify(prev));
          temp[idx].math = text;
          return temp;
        });
      };
      const setBorder = () => {
        setProblem_array((prev) => {
          const idx = prev.findIndex((v) => v.id === item.id);
          const temp = JSON.parse(JSON.stringify(prev));
          temp[idx].border = !temp[idx].border;
          return temp;
        });
      };
      const setTitle = (title) => {
        setProblem_array((prev) => {
          const idx = prev.findIndex((v) => v.id === item.id);
          const temp = JSON.parse(JSON.stringify(prev));
          temp[idx].title = title;
          return temp;
        });
      };
      const change = (obj) => {
        setProblem_array((prev) => {
          const idx = prev.findIndex((v) => v.id === item.id);
          const temp = JSON.parse(JSON.stringify(prev));
          temp[idx] = { id: item.id, border: item.border, ...obj };
          return temp;
        });
      };

      return (
        <MathBox
          key={"problem_" + id}
          text={math}
          setText={setText}
          setBorder={setBorder}
          moveUp={onUp}
          moveDown={onDown}
          onDelete={onDelete}
          setTitle={setTitle}
          change={change}
          title={title}
          dragHandleProps={dragHandleProps}
          dragged={dragged}
        />
      );
    } else if (type === "image") {
      const setUrl = (url) => {
        setProblem_array((prev) => {
          const idx = prev.findIndex((v) => v.id === item.id);
          const temp = JSON.parse(JSON.stringify(prev));
          temp[idx].url = url;
          return temp;
        });
      };
      const change = (obj) => {
        setProblem_array((prev) => {
          const idx = prev.findIndex((v) => v.id === item.id);
          const temp = JSON.parse(JSON.stringify(prev));
          temp[idx] = { id: item.id, ...obj };
          return temp;
        });
      };
      return (
        <ImageBox
          width={800}
          url={url}
          setUrl={setUrl}
          moveUp={onUp}
          moveDown={onDown}
          dragged={dragged}
          onDelete={onDelete}
          dragHandleProps={dragHandleProps}
          change={change}
        />
      );
    } else if (type === "whiteSpace") {
      const setLineHeight = (lineHeight) => {
        setProblem_array((prev) => {
          const idx = prev.findIndex((v) => v.id === item.id);
          const temp = JSON.parse(JSON.stringify(prev));
          temp[idx].lineHeight = lineHeight;
          return temp;
        });
      };
      return (
        <WhiteSpaceBox
          lineHeight={lineHeight}
          setLineHeight={setLineHeight}
          dragged={dragged}
          moveUp={onUp}
          moveDown={onDown}
          onDelete={onDelete}
          dragHandleProps={dragHandleProps}
        />
      );
    } else {
      const setText = (text) => {
        setProblem_array((prev) => {
          const idx = prev.findIndex((v) => v.id === item.id);
          const temp = JSON.parse(JSON.stringify(prev));
          temp[idx].text = text;
          return temp;
        });
      };
      const setAlign = (align) => {
        setProblem_array((prev) => {
          const idx = prev.findIndex((v) => v.id === item.id);
          const temp = JSON.parse(JSON.stringify(prev));
          temp[idx].align = align;
          return temp;
        });
      };
      const setBorder = () => {
        setProblem_array((prev) => {
          const idx = prev.findIndex((v) => v.id === item.id);
          const temp = JSON.parse(JSON.stringify(prev));
          temp[idx].border = !temp[idx].border;
          return temp;
        });
      };
      const setTitle = (title) => {
        setProblem_array((prev) => {
          const idx = prev.findIndex((v) => v.id === item.id);
          const temp = JSON.parse(JSON.stringify(prev));
          temp[idx].title = title;
          return temp;
        });
      };
      const change = (obj) => {
        setProblem_array((prev) => {
          const idx = prev.findIndex((v) => v.id === item.id);
          const temp = JSON.parse(JSON.stringify(prev));
          temp[idx] = { id: item.id, border: item.border, ...obj };
          return temp;
        });
      };

      return (
        <TextBox
          align="center"
          border
          text={text}
          setText={setText}
          setAlign={setAlign}
          setBorder={setBorder}
          moveUp={onUp}
          dragged={dragged}
          moveDown={onDown}
          onDelete={onDelete}
          setTitle={setTitle}
          title={title}
          dragHandleProps={dragHandleProps}
          change={change}
        />
      );
    }
  },
  (prevProps, nextProps) => {
    for (const index in nextProps) {
      if (nextProps[index] !== prevProps[index]) {
        console.log(index, prevProps[index], "-->", nextProps[index]);
      }
    }
  }
);
EditItem.displayName = "EditItem";

const Editor = ({ setArray, array }) => {
  const _container = useRef(null);
  const onAddText = () => {
    setArray((prev) => {
      const temp = JSON.parse(JSON.stringify(prev));
      temp.push({
        type: "text",
        text: "문장",
        align: "flex-start",
        border: false,
        id: prev.length + Math.random(),
      });
      return temp;
    });
  };
  const onAddImage = () => {
    setArray((prev) => {
      const temp = JSON.parse(JSON.stringify(prev));
      temp.push({
        type: "image",
        url: "https://img-cf.kurly.com/shop/data/goodsview/20201012/gv10000126356_1.jpg",
        id: prev.length + Math.random(),
      });
      return temp;
    });
  };
  const onAddMath = () => {
    setArray((prev) => {
      const temp = JSON.parse(JSON.stringify(prev));
      temp.push({
        type: "math",
        math: "\\(ax^2 + bx + c = 0\\)",
        id: prev.length + Math.random(),
      });
      return temp;
    });
  };
  const onClipBoard = () => {
    if (
      window.confirm(
        "작업물을 복사하시겠습니까?\n아르바이트 작업자는 사용하실 수 없습니다."
      )
    ) {
      alert(JSON.stringify(array));
    }
  };
  return (
    <Col
      style={{
        // width: "50%",
        justifyContent: "flex-start",
        alignItems: "flex-start",
        height: "auto",
      }}
    >
      <Row style={{ height: 40, justifyContent: "flex-start" }}>
        <Button variant="contained" onClick={onAddText}>
          텍스트 추가
        </Button>
        <Button variant="contained" onClick={onAddImage}>
          이미지 추가
        </Button>
        <Button variant="contained" onClick={onAddMath}>
          수식 추가
        </Button>
        <Button variant="contained" onClick={onClipBoard}>
          클립보드 복사
        </Button>
      </Row>

      <Col
        style={{
          height: 400,
          // overflow: "scroll",
          justifyContent: "flex-start",
          overflow: "auto",
          border: "1px solid gray",
          width: 500,
        }}
        ref={_container}
      >
        <DraggableList
          list={array.map((v) => {
            return { ...v, setProblem_array: setArray };
          })}
          template={EditItem}
          container={() => _container.current}
          itemKey="id"
          onMoveEnd={setArray}
        />
      </Col>
    </Col>
  );
};

export default Editor;

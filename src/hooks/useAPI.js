import axios from "axios";
const useAPI = () => {
  const API = axios.create({
    baseURL:
      "https://pajwaz301d.execute-api.ap-northeast-2.amazonaws.com/stage1",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",

      Accept: "*/*",
    },
  });

  const api = {
    insertexamkorea: (event) => API.post(`/insertexamkorea`, event.body),
    getproblembysearch: (event) =>
      API.get(`/getproblembysearch?meta_id=${event.id}&idx=${event.idx}`),
    getproblembyid: (event) => API.get(`/getproblembyid?id=${event.id}`),
    getexam: (event) => API.get(`/getexam?id=${event.id}`),
    submitproblem: (event) => API.post(`/submitproblem`, event.body),
    registerexam: (event) => API.post(`/registerexam`, event.body),
    deleteexam: (event) => API.delete(`deleteexam?id=${event.id}`),
    deleteproblem: (event) => API.delete(`deleteproblem?id=${event.id}`),
    insertText: (event) => API.post(`/inserttext`, event.body),
    getText: (event) => API.get(`/gettext?id=${event.id}`),
    submithan: (event) => API.post(`/submithan`, event.body),
    getproblemhanbyid: (event) => API.get(`/getproblemhanbyid?id=${event.id}`),
    getproblemhanbysearch: (event) =>
      API.post(`/getproblemhanbysearch`, event.body),
    submitmath: (event) => API.post(`/submitmath`, event.body),
    getproblemmathbyid: (event) =>
      API.get(`/getproblemmathbyid?id=${event.id}`),
    getproblemmathbysearch: (event) =>
      API.post(`/getproblemmathbysearch`, event.body),
    modifyExam: (event) => API.post(`/modifyexam`, event.body),
    checkProblem: (event) => API.post(`/checkproblem?id=${event.id}`),
    getProblemKoreabyID: (event) =>
      API.get(`/productproblem/getproblemkoreabyid?id=${event.id}`),
    updateProblemKorea: (event) =>
      API.post(`/productproblem/updateproblemkorea`, event.body),
    getTextKorea: (event) =>
      API.get(`/productproblem/gettextkorea?id=${event.id}`),
    inserttextkorea: (event) =>
      API.post(`/productproblem/inserttextkorea`, event.body),
    getProblemEnglishbyID: (event) =>
      API.get(`/productproblem/getproblemenglishbyid?id=${event.id}`),
    updateproblemenglish: (event) =>
      API.post(`/productproblem/updateproblemenglish`, event.body),
    getsentencebyobject: (event) =>
      API.get(`/koreasentence/getsentencebyobject?meta_id=${event.id}`),
    submitsentencebyobject: (event) =>
      API.post(`/koreasentence/submitsentencebyobject`, event.body),
    getProductionMathInfo: (event) =>
      API.get(`/getproductionmathinfo?id=${event.id}`),
    updateProductionMathInfo: (event) =>
      API.post(`/updateproductionmathinfo`, event.body),
    getCheckedScienceProblem: (event) => API.get(`/getcheckedscienceproblem`),
    getCurrentCheckedScienceProblem: (event) =>
      API.get(`/getcurrentcheckedscienceproblem?meta_id=${event.meta_id}`),
    getCheckedSocietyProblem: (event) => API.get(`/getcheckedsocietyproblem`),
    getCurrentCheckedSocietyProblem: (event) =>
      API.get(`/getcurrentcheckedsocietyproblem?meta_id=${event.meta_id}`),
    geterrorreportlist: (event) =>
      API.get(
        `/geterrorreportlist?page=${event.page}&subject=${event.subject}`
      ),
  };

  const newMath = {
    getNewMathProblemByTestIdAndProblemIndex: (event) =>
      API.get(
        `/newmath/getnewmathproblembytestidandproblemindex?test_id=${event.test_id}&problem_index=${event.problem_index}`
      ),
    updateNewMath: (event) => API.post(`/newmath`, event.body),
    getNewMathProblemByProblemId: (event) =>
      API.get(
        `/newmath/getnewmathproblembyproblemid?problem_id=${event.problem_id}`
      ),
  };

  const science = {
    getScienceProblemByTestIdAndProblemIndex: (event) =>
      API.get(
        `/getscienceproblembytestidandproblemindex?test_id=${event.test_id}&problem_index=${event.problem_index}`
      ),
    updateScience: (event) => API.post(`/updatescience`, event.body),
    getScienceProblemByProblemId: (event) =>
      API.get(`/getscienceproblembyproblemid?problem_id=${event.problem_id}`),
    getUnCheckedScienceProblemByLessonId: (event) =>
      API.get(`/getuncheckedscienceproblembylessonid?meta_id=${event.meta_id}`),
  };

  const society = {
    getSocietyProblemByTestIdAndProblemIndex: (event) =>
      API.get(
        `/getsocietyproblembytestidandproblemindex?test_id=${event.test_id}&problem_index=${event.problem_index}`
      ),
    updateSociety: (event) => API.post(`/updatesociety`, event.body),
    getSocietyProblemByProblemId: (event) =>
      API.get(`/getsocietyproblembyproblemid?problem_id=${event.problem_id}`),
    getUnCheckedSocietyProblemByLessonId: (event) =>
      API.get(`/getuncheckedsocietyproblembylessonid?meta_id=${event.meta_id}`),
  };

  const returnValue = [
    {
      API,
      api,
      newMath,
      science,
      society,
    },
  ];

  return returnValue;
};

export default useAPI;

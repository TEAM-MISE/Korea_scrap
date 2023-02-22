import axios from "axios";
const useMathpix = () => {
  const MATH_API = axios.create({
    baseURL: "https://api.mathpix.com",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",

      Accept: "*/*",
      app_id: "minsoojang_mise_team_8096c8_853ff3",
      app_key:
        "fee9e340fe4d72b287e1225227ad8ec3771882ded1de856adc4d20dd8e7627ef",
    },
  });

  const api = {
    convertImgToTxt: (event) => MATH_API.post(`/v3/text`, event.body),
  };

  const returnValue = [
    {
      MATH_API,
      api,
    },
  ];

  return returnValue;
};

export default useMathpix;

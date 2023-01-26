import axios from "axios";

export const salarySearchForm = async (data) => {
  try {
    const res = await axios({
      method: "POST",
      url: "http://127.0.0.1:8000/api/v1/users/search",
      data: {
        data,
      },
    });
    if (res.data.status == "success") {
      console.log(res.data.locals);
    }
  } catch (err) {}
};

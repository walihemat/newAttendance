import axios from "axios";

export const salarySearchForm = async (data) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/search",
      data: {
        data,
      },
    });
    if (res.data.status == "success") {
      console.log(res.data.locals);
    }
  } catch (err) {}
};

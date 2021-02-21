import React from "react";

export const defaultValue = {
  responseData: {
    lower_eval: "Your lower-case letter-width consistency score is: 0.84. Great lower-case width consistency!",
    upper_eval:  "Your upper-case letter-width consistency score is: nan. Great upper-case width consistency!",
  },
  image: "https://via.placeholder.com/200",
};
export default React.createContext([defaultValue, () => {}]);

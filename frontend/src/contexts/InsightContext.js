import React from "react";

export const defaultValue = {
	responseData: {},
	image: "https://via.placeholder.com/200"
};
export default React.createContext([defaultValue, () => {}]);

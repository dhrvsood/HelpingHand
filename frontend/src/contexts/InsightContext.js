import React from "react";

export const defaultValue = {
	responseData: {
		"handwritingScore" : 90,
		"rating" : "not bad, work on dotting your is"
	},
	image: "https://via.placeholder.com/200"
};
export default React.createContext([defaultValue, () => {}]);

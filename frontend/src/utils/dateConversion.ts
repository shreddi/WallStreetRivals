import moment from "moment";

//convert date object to string.
export const dateToString = (date: Date): string => {
  const formattedDate = moment(date).format("YYYY-MM-DD");
  return formattedDate;
};

//convert date to string object.
export const stringToDate = (date: string): Date => {
  const formattedDate = moment(date).toDate();
  return formattedDate;
};

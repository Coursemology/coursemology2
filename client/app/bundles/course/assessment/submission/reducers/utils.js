export default function arrayToObjectById(array) {
  return array.reduce((obj, answer) => (
    { ...obj, [answer.id]: answer }
  ), {});
}

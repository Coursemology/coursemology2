// eslint-disable-next-line import/prefer-default-export
export const processStaff = (staff) => ({
  ...staff,
  numGraded: parseInt(staff.numGraded ?? 0, 10),
  numStudents: parseInt(staff.numStudents ?? 0, 10),
});

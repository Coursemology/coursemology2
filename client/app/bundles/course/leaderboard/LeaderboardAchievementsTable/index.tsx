import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

const LeaderboardAchievementsTable = (props) => {
  console.log(props.data);
  const isHidden = props.data ? "table" : "none";
  return (
    <TableContainer component={Paper} style={{display: isHidden}} elevation={2}>
      <Table>
        <TableHead>
        <TableRow><TableCell align="center" colSpan={12}>By Achievements</TableCell></TableRow>
          <TableRow>
            <TableCell align="center">Rank</TableCell>
            <TableCell align="center">Name</TableCell>
            <TableCell align="center">Number of achievements</TableCell>
            <TableCell align="center">Achievements</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.map((val, index) => (
            <TableRow key={index}>
              <TableCell align="center">{index}</TableCell>
              <TableCell align="center">{val.name}</TableCell>
              <TableCell align="center">{val.achievements.length}</TableCell>
              <TableCell align="center">--insert achievements--</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
};

export default LeaderboardAchievementsTable;
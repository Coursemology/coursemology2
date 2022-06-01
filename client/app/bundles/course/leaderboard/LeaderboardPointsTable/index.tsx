import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from "@mui/material";

const LeaderboardPointsTable = (props) => {

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow><TableCell align="center" colSpan={12}>By Experience Points</TableCell></TableRow>
          <TableRow>
            <TableCell align="center">Rank</TableCell>
            <TableCell align="center">Name</TableCell>
            <TableCell align="center">Level</TableCell>
            <TableCell align="center">Experience</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.data.map((val, index) => (
            <TableRow key={index}>
              <TableCell align="center">{index}</TableCell>
              <TableCell align="center">{val.name}</TableCell>
              <TableCell align="center">{val.level}</TableCell>
              <TableCell align="center">{val.experience}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
};

export default LeaderboardPointsTable;
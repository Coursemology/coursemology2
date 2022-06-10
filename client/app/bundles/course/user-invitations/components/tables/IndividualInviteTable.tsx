// import {
//   Paper,
//   Grid,
//   Typography,
//   Button,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
// } from '@mui/material';
// import { FC, useState } from 'react';
// import { useForm, FormProvider } from 'react-hook-form';
// import {
//   defineMessages,
//   FormattedMessage,
//   injectIntl,
//   WrappedComponentProps,
// } from 'react-intl';
// import { toast } from 'react-toastify';
// import { ManageCourseUsersPermissions } from 'types/course/courseUsers';
// import { IndividualInviteRowData } from 'types/course/userInvitations';
// import { inviteUsersFromForm } from '../../operations';
// import IndividualInviteFormRow from '../forms/IndividualInviteFormRow';

// interface Props extends WrappedComponentProps {
//   permissions: ManageCourseUsersPermissions;
// }

// type IFormInputs = IndividualInviteRowData[];

// const translations = defineMessages({
//   tableTitle: {
//     id: 'course.userInvitations.components.tables.IndividualInviteTable.tableTitle',
//     defaultMessage: 'Individually Add Users',
//   },
//   newRowButton: {
//     id: 'course.userInvitations.components.tables.IndividualInviteTable.button.newRow',
//     defaultMessage: 'Add new row',
//   },
//   nameColumn: {
//     id: 'course.userInvitations.components.tables.IndividualInviteTable.column.name',
//     defaultMessage: 'Name',
//   },
//   emailColumn: {
//     id: 'course.userInvitations.components.tables.IndividualInviteTable.column.email',
//     defaultMessage: 'Email',
//   },
//   roleColumn: {
//     id: 'course.userInvitations.components.tables.IndividualInviteTable.column.role',
//     defaultMessage: 'Role',
//   },
//   phantomColumn: {
//     id: 'course.userInvitations.components.tables.IndividualInviteTable.column.phantom',
//     defaultMessage: 'Phantom',
//   },
//   timelineAlgorithmColumn: {
//     id: 'course.users.components.tables.IndividualInviteTable.column.timelineAlgorithm',
//     defaultMessage: 'Timeline Algorithm',
//   },
//   actionsColumn: {
//     id: 'course.userInvitations.components.tables.IndividualInviteTable.column.acceptedAt',
//     defaultMessage: 'Actions',
//   },
// });

// const IndividualInviteTable: FC<Props> = (props) => {
//   const { permissions, intl } = props;
//   const initialValues = [
//     {
//       name: '',
//       email: '',
//       role: 'student',
//       phantom: false,
//       ...(permissions.canManagePersonalTimes && {
//         timelineAlgorithm: 'fixed',
//       }),
//     },
//   ];
//   const methods = useForm<IFormInputs>({
//     defaultValues: initialValues,
//   });
//   const {
//     handleSubmit,
//     setError,
//     formState: { errors, isDirty, isSubmitting },
//   } = methods;
//   const [rows, setRows] = useState<IndividualInviteRowData[]>(initialValues);

//   const handleAddNewRow = () => {
//     console.log('add row!!!!');
//     const abc = {
//       name: 'eve',
//       email: '',
//       role: 'student',
//       phantom: true,
//       ...(permissions.canManagePersonalTimes && {
//         timelineAlgorithm: 'fixed',
//       }),
//     };
//     setRows([...rows, abc]);
//   };

//   const onSubmit = (data: any, _setError): Promise<void> => {
//     console.log('sending data onsubmit', data);
//     console.log('errors', errors);
//     console.log('form isdirty:', isDirty);
//     return dispatchEvent(inviteUsersFromForm(data)).then((response) => {
//       const { success, warning } = response;
//       if (success) toast.success(success);
//       if (warning) toast.warn(warning);
//     });
//     // console.log('sending data onsubmit', data);
//     // setIsLoading(true);
//     // return dispatch(inviteUsersFromFile(data))
//     //   .then((response) => {
//     //     const { success, warning } = response;
//     //     if (success) toast.success(success);
//     //     if (warning) toast.warn(warning);
//     //     setTimeout(() => {
//     //       handleClose();
//     //     }, 1500);
//     //   })
//     //   .catch((error) => {
//     //     console.log('error', error);
//     //     toast.error(intl.formatMessage(translations.failure));
//     //     if (error.response?.data) {
//     //       setReactHookFormError(setError, error.response.data.errors);
//     //     }
//     //     throw error;
//     //   })
//     //   .finally(() => {
//     //     setIsLoading(false);
//     //   });
//   };

//   const renderHeader = (
//     <TableRow>
//       <TableCell>
//         <FormattedMessage {...translations.nameColumn} />
//       </TableCell>
//       <TableCell>
//         <FormattedMessage {...translations.emailColumn} />
//       </TableCell>
//       <TableCell>
//         <FormattedMessage {...translations.roleColumn} />
//       </TableCell>
//       <TableCell>
//         <FormattedMessage {...translations.phantomColumn} />
//       </TableCell>
//       {permissions.canManagePersonalTimes && (
//         <TableCell>
//           <FormattedMessage {...translations.timelineAlgorithmColumn} />
//         </TableCell>
//       )}
//       <TableCell>
//         <FormattedMessage {...translations.actionsColumn} />
//       </TableCell>
//     </TableRow>
//   );

//   const renderNewRowButton = (
//     <Button variant="contained" onClick={handleAddNewRow}>
//       <FormattedMessage {...translations.newRowButton} />
//     </Button>
//   );

//   return (
//     <Paper elevation={3} sx={{ padding: '12px' }}>
//       <Grid container flexDirection="row" justifyContent="space-between">
//         <Typography variant="h5">
//           {intl.formatMessage(translations.tableTitle)}
//         </Typography>
//         {renderNewRowButton}
//       </Grid>
//       <FormProvider {...methods}>
//         <form
//           encType="multipart/form-data"
//           id="invite-users-individual-form"
//           noValidate
//           onSubmit={handleSubmit((data) => onSubmit(data, setError))}
//         >
//           <Table>
//             <TableHead>{renderHeader}</TableHead>
//             <TableBody>
//               {rows.map((row, index) => (
//                 <IndividualInviteFormRow key={index} row={row} index={index} />
//               ))}
//             </TableBody>
//           </Table>
//         </form>
//       </FormProvider>
//       <Button
//         className="btn-submit"
//         variant="contained"
//         sx={{ marginTop: '4px' }}
//         disabled={isSubmitting}
//         form="invite-users-individual-form"
//         key="invite-users-individual-form-submit-button"
//         type="submit"
//       >
//         Invite All Users
//       </Button>
//     </Paper>
//   );
// };

// export default injectIntl(IndividualInviteTable);

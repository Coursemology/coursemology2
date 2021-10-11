import React from "react";
import PropTypes from "prop-types";

const styles = {
    label: {
        border: '1px solid #B0BEC5',
        borderBottom: 0,
        padding: '5px 16px',
    },
    labelSelected: {
        backgroundColor: '#F9FBE7',
    },
    labelEdited: {
        border: '1px solid #B0BEC5',
        backgroundColor: '#FFCC80',
    },
    labelDeleted: {
        border: '1px solid #B0BEC5',
        backgroundColor: '#F48FB1',
    },
}

function Labels({status}) {
    return (
        <div>
            {
                status.edited &&
                <div style={{...styles.label, ...styles.labelEdited}}>
                    <i className="fa fa-refresh" aria-hidden="true"/> &nbsp; Post has been edited in the forum.
                    Showing post as at submission.
                </div>
            }
            {
                status.deleted &&
                <div style={{...styles.label, ...styles.labelDeleted}}>
                    <i className="fa fa-trash" aria-hidden="true"/> &nbsp; Post has been deleted from forum topic.
                    Showing post as at submission.
                </div>
            }
        </div>
    );
}

Labels.propTypes = {
    status: PropTypes.shape({
        edited: PropTypes.bool,
        deleted: PropTypes.bool,
    }),
};

export default Labels;
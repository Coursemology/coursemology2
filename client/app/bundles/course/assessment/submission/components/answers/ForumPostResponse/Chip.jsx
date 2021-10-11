import React from "react";
import PropTypes from "prop-types";

const styles = {
    chip: {
        borderRadius: 15,
        backgroundColor: '#FAFAFA',
        paddingTop: 2,
        paddingBottom: 2,
        paddingLeft: 20,
        paddingRight: 20,
        fontSize: 15,
        marginRight: 10,
    },
}

function Chip({text}) {
    return (
        <font style={styles.chip}>
            {text}
        </font>
    )
}

Chip.propTypes = {
    text: PropTypes.string,
};

export default Chip;

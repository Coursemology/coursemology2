import React from "react";
import PropTypes from "prop-types";
import Checkbox from "material-ui/Checkbox";
import ForumPost from "../../../../../forum/components/ForumPost";
import ParentPost from "./ParentPost";
import {postPackShape} from "course/assessment/submission/propTypes";

const styles = {
    row: {
        display: 'table-row',
        border: '3px solid #fff',
        width: '100%',
    },
    cellCheckbox: {
        display: 'table-cell',
        width: '42px',
        margin: 0,
        padding: 0,
    },
    cellPost: {
        display: 'table-cell',
        width: '1000px',
    },
    checkbox: {
        margin: 0,
        padding: 0,
    },
}

export default class Option extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isSelected: this.props.isSelected,
        };
    }

    render() {
        const postpack = this.props.postpack;
        return (
            <div style={styles.row}>
                <div style={styles.cellCheckbox}>
                    <Checkbox style={styles.checkbox}
                              checked={this.props.isSelected}
                              onClick={() => {
                                  this.props.onSelectPostpack(postpack, this.props.isSelected)
                              }}
                    />
                </div>
                <div style={styles.cellPost}>
                    <ForumPost post={postpack.corePost}
                               asmSubStatus={this.state.isSelected}
                               isExpandable
                    />
                    {postpack.parentPost && <ParentPost post={postpack.parentPost}/>}
                    <br/>
                </div>
            </div>
        );
    }
}

Option.propTypes = {
    postpack: postPackShape,
    isSelected: PropTypes.bool,
    onSelectPostpack: PropTypes.func,
};

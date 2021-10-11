import React from "react";
import PropTypes from "prop-types";
import Checkbox from "material-ui/Checkbox";
import Snackbar from 'material-ui/Snackbar';
import ForumPost from "../../../../../forum/components/ForumPost";
import ParentPost from "./ParentPost";

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
            selected: false,
            showErrorMsg: false,
        };
    }

    handleCheckboxToggle = (e) => {
        const selected = e.target.checked;
        if (!selected || (selected && this.props.qtyPostsSelected < this.props.maxPosts)) {
            this.setState((oldState) => {
                return {
                    selected: !oldState.selected,
                }
            });
            this.props.onToggleOption(selected, this.props.post.post.id);
        } else {
            this.setState({
                showErrorMsg: true,
            });
        }
    }

    handleRequestClose = () => {
        this.setState({
            showErrorMsg: false,
        });
    };

    render() {
        const post = this.props.post.post
        return (
            <div style={styles.row}>
                <div style={styles.cellCheckbox}>
                    <Checkbox style={styles.checkbox}
                              checked={this.state.selected}
                              onClick={this.handleCheckboxToggle}
                    />
                </div>
                <div style={styles.cellPost}>
                    <ForumPost text={post.text}
                               userName={post.userName}
                               avatar={post.avatar}
                               createdAt={post.createdAt}
                               asmSubStatus={this.state.selected}/>
                    {this.props.post.parent && <ParentPost parent={this.props.post.parent}/>}
                    <br/>
                </div>
                <Snackbar
                    open={this.state.showErrorMsg}
                    message="Unable to select post, as you have selected the max no. of posts allowed."
                    autoHideDuration={4000}
                    onRequestClose={this.handleRequestClose}
                />
            </div>
        );
    }
}


Option.propTypes = {
    onToggleOption: PropTypes.func,
    qtyPostsSelected: PropTypes.number,
    maxPosts: PropTypes.number,
    postID: PropTypes.number,
    post: PropTypes.object,
    parent: PropTypes.object,
};

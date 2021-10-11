import React from "react";
import PropTypes from 'prop-types';

import RaisedButton from "material-ui/RaisedButton";
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";

import Forum from "./Forum";

const styles = {
    dialogTitle: {
        color: '#EEE',
        background: '#006064',
        padding: '20px 30px',
        lineHeight: '85%',
    },
    dialogContainer: {
        height: 800,
        maxHeight: '90%',
        width: 1200,
        maxWidth: '100%',
    },
}

export default class PostSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            qtyPostsSelected: 0,
            maxPosts: this.props.question.max_posts,
            openSelector: false,
            selectedPosts: [],
        };
    }

    handleOptionTopicToggle = (selected, postID) => {
        if (selected) {
            this.setState((oldState) => ({
                qtyPostsSelected: oldState.qtyPostsSelected + 1,
                selectedPosts: [...oldState.selectedPosts, postID],
            }));
        } else {
            const selectedPosts = this.removePost(postID);
            this.setState((oldState) => ({
                qtyPostsSelected: oldState.qtyPostsSelected - 1,
                selectedPosts,
            }));
        }
    }

    handlePostSelection = () => {
        this.handleCloseSelector();
    }

    handleOpenSelector = () => {
        this.setState({openSelector: true});
    };

    handleCloseSelector = () => {
        this.setState({openSelector: false});
    };

    removePost(postID){
        const selectedPosts = [...this.state.selectedPosts];
        const index = selectedPosts.indexOf(postID);
        if (index !== -1) {
            selectedPosts.splice(index, 1);
        }
        return selectedPosts;
    }

    renderDialogTitle() {
        return (
            <div style={styles.dialogTitle}>
                <div style={{fontSize: 23, marginBottom: 15}}>
                    SELECT FORUM POST
                </div>
                <div style={{fontSize: 15}}>
                    Select {this.props.question.max_posts > 1 && 'up to '}
                    <b>{this.props.question.max_posts} forum {this.props.question.max_posts > 1 ? 'posts' : 'post'}</b>.
                    You have selected&nbsp;
                    {this.state.qtyPostsSelected} {this.state.qtyPostsSelected > 1 ? 'posts' : 'post'}.
                </div>
                <div style={{fontSize: 15, color: '#ccc'}}>
                    Click on the forum name, then the topic title to view the post(s) made by you.
                </div>
            </div>
        );
    }

    renderPostMenu() {
        const {forumTopicPosts} = this.props;
        return (
            <div>
                <br />
                {
                    forumTopicPosts && forumTopicPosts.map((topicPosts) => (
                        <Forum topicPosts={topicPosts}
                               course={topicPosts.course}
                               onToggleTopicOption={this.handleOptionTopicToggle}
                               qtyPostsSelected={this.state.qtyPostsSelected}
                               maxPosts={this.state.maxPosts}
                               key={topicPosts.forum.id}
                        />
                    ))
                }
                <br />
            </div>
        );
    }

    render() {
        const actions = [
            <FlatButton
                label="Cancel"
                secondary
                onClick={this.handleCloseSelector}
                key={0}
            />,
            <RaisedButton
                label={
                    this.state.qtyPostsSelected > 0 ?
                        `Select ${this.state.qtyPostsSelected} ${this.state.qtyPostsSelected > 1 ? 'posts' : 'post'}` :
                        'Select'
                }
                primary
                onClick={this.handlePostSelection}
                disabled={this.state.qtyPostsSelected < 1}
                key={1}
            />,
        ];

        return (
            <>
                <RaisedButton label="Select Forum Post"
                              labelPosition="before"
                              icon={<i className="fa fa-paperclip" aria-hidden="true" />}
                              primary
                              onClick={this.handleOpenSelector}
                />
                <Dialog
                    title={this.renderDialogTitle()}
                    actions={actions}
                    modal={false}
                    open={this.state.openSelector}
                    onRequestClose={this.handleCloseSelector}
                    contentStyle={styles.dialog}
                    autoScrollBodyContent
                >
                    <div style={styles.dialogContainer}>
                        {this.renderPostMenu()}
                    </div>
                </Dialog>
            </>
        );
    }
}

PostSelector.propTypes = {
    forumTopicPosts: PropTypes.object,
    question: PropTypes.shape({
        max_posts: PropTypes.number,
    }),
};
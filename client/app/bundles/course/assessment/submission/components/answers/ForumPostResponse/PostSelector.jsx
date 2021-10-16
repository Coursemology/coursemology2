import React from "react";
import PropTypes from 'prop-types';

import RaisedButton from "material-ui/RaisedButton";
import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";

import {forumTopicPostPackShape} from "course/assessment/submission/propTypes";
import Error from "./Error";
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
            openSelector: false,
        };
    }

    handleOpenSelector = () => {
        this.setState({openSelector: true});
    };

    handleCloseSelector = () => {
        this.setState({openSelector: false});
    };

    isExpanded(forumTopicPostpack){
        let matched = false;
        forumTopicPostpack.topicPostpacks.forEach(topicPostpack => {
            topicPostpack.postpacks.forEach(postpack => {
                if (this.props.selectedPostIds.includes(postpack.corePost.id)) {
                    matched = true;
                }
            })
        })
        return matched;
    }

    renderDialogTitle() {
        const maxPosts = this.props.maxPosts;
        const qtySelected = this.props.selectedPostIds.length;
        return (
            <div style={styles.dialogTitle}>
                <div style={{fontSize: 23, marginBottom: 15}}>
                    SELECT FORUM POST
                </div>
                <div style={{fontSize: 15}}>
                    Select {maxPosts > 1 && 'up to'} <b>{maxPosts} forum {maxPosts > 1 ? 'posts' : 'post'}</b>.
                    You have selected {qtySelected} {qtySelected > 1 ? 'posts' : 'post'}.
                </div>
                <div style={{fontSize: 15, color: '#ccc'}}>
                    Click on the forum name, then the topic title to view the post(s) made by you.
                </div>
            </div>
        );
    }

    renderPostMenu() {
        const {forumTopicPostpacks} = this.props;
        return (
            <div>
                <br/>
                {
                    forumTopicPostpacks && forumTopicPostpacks.map((forumTopicPostpack) => (
                        <Forum forumTopicPostpack={forumTopicPostpack}
                               selectedPostIds={this.props.selectedPostIds}
                               onSelectPostpack={
                                   (postpackSelected, isSelected) =>
                                       this.props.onSelectPostpack(postpackSelected, isSelected)
                               }
                               isExpanded={this.isExpanded(forumTopicPostpack)}
                               key={forumTopicPostpack.forum.id}
                        />
                    ))
                }
                <br/>
            </div>
        );
    }

    render() {
        const qtySelected = this.props.selectedPostIds.length;
        const actions = [
            // eslint-disable-next-line react/jsx-key
            <FlatButton
                label={qtySelected > 0 ? `Select ${qtySelected} ${qtySelected > 1 ? 'posts' : 'post'}` : 'Cancel'}
                primary
                onClick={this.handleCloseSelector}
            />,
        ];

        return (
            <>
                <RaisedButton label="Select Forum Post"
                              icon={<i className="fa fa-paperclip" aria-hidden="true"/>}
                              primary
                              onClick={this.handleOpenSelector}
                              disabled={this.props.hasError}
                />
                {
                    this.props.hasError &&
                    <Error message="Oops! Unable to retrieve your forum posts. Please try refreshing this page."/>
                }
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
    forumTopicPostpacks: PropTypes.arrayOf(forumTopicPostPackShape),
    selectedPostIds: PropTypes.arrayOf(PropTypes.number),
    maxPosts: PropTypes.number,
    onSelectPostpack: PropTypes.func,
    hasError: PropTypes.bool,
};

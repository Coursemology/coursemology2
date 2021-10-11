import React from 'react';
import {
    blueGrey50,
} from 'material-ui/styles/colors';
import {Card, CardHeader, CardText} from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import PropTypes from "prop-types";

const styles = {
    selectedForAsmSub: {
        boxShadow: 0,
        backgroundColor: blueGrey50,
        border: '1px solid #B0BEC5',
    },
    replyPost: {
        boxShadow: 0,
        border: '1px dashed #ddd',
    },
    defaultCard: {
        boxShadow: 0,
        border: '1px solid #B0BEC5',
    },
}

export default class ForumPost extends React.Component {

    renderStyle() {
        if (this.props.asmSubStatus) {
            return styles.selectedForAsmSub
        } else if (this.props.replyPost) {
            return styles.replyPost
        } else {
            return styles.defaultCard
        }
    }

    render() {
        return (
            <div>
                <Card style={this.renderStyle()}>
                    <CardHeader
                        title={this.props.userName}
                        subtitle={this.props.createdAt}
                        avatar={this.props.avatar}
                    />
                    <Divider/>
                    <CardText>
                        <div dangerouslySetInnerHTML={{__html: this.props.text}}/>
                    </CardText>
                </Card>
            </div>
        );
    }
}

ForumPost.propTypes = {
    asmSubStatus: PropTypes.bool,
    replyPost: PropTypes.bool,
    text: PropTypes.string,
    userName: PropTypes.string,
    avatar: PropTypes.string,
    createdAt: PropTypes.string,
};

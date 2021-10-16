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

const maxHeight = 160;

export default class ForumPost extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLengthy: false,
            textHeight: 'auto',
            overflowState: 'hidden',
            isClipped: false,
        };
    }

    componentDidMount() {
        const renderedTextHeight = this.divElement.clientHeight;
        if (this.props.isExpandable && renderedTextHeight > maxHeight) {
            this.setState({
                isLengthy: true,
                textHeight: maxHeight,
                isClipped: true,
            });
        }
    }

    handleToggleVisibility() {
        const clippedState = {
            textHeight: maxHeight,
            isClipped: true,
        }
        const expandedState = {
            textHeight: 'auto',
            isClipped: false,
        }

        if (this.state.isClipped) {
            this.setState(expandedState);
        } else {
            this.setState(clippedState);
        }
    }

    renderStyle() {
        if (this.props.asmSubStatus) {
            return styles.selectedForAsmSub
        }

        if (this.props.replyPost) {
            return styles.replyPost
        }

        return styles.defaultCard
    }

    render() {
        return (
            <div>
                <Card style={this.renderStyle()}>
                    <CardHeader
                        title={this.props.post.userName}
                        subtitle={this.props.post.updatedAt}
                        avatar={this.props.post.avatar}
                    />
                    <Divider/>
                    <CardText>
                        <div dangerouslySetInnerHTML={{__html: this.props.post.text}}
                             ref={(divElement) => {
                                 this.divElement = divElement
                             }}
                             style={{
                                 height: this.state.textHeight,
                                 overflow: this.state.overflowState,
                             }}
                        />
                        {
                            this.state.isLengthy &&
                            <div style={{paddingTop: 8}}>
                                {this.state.isClipped && <div style={{height: 10}}/>}
                                <font onClick={() => this.handleToggleVisibility()} style={{
                                    cursor: 'pointer',
                                    color: '#03A9F4',
                                }}>
                                    {this.state.isClipped ? "SHOW MORE" : "SHOW LESS"}
                                </font>
                            </div>
                        }
                    </CardText>
                </Card>
            </div>
        );
    }
}

ForumPost.propTypes = {
    asmSubStatus: PropTypes.bool,
    post: PropTypes.shape({
        text: PropTypes.string,
        userName: PropTypes.string,
        avatar: PropTypes.string,
        updatedAt: PropTypes.string,
    }),
    replyPost: PropTypes.bool,
    isExpandable: PropTypes.bool,
};

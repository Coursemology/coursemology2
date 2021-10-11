import React from "react";
import PropTypes from "prop-types";

import {Card, CardTitle, CardText, CardActions} from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import Chip from './Chip';
import Option from './Option';

const styles = {
    card: {
        border: '1px solid #ccc',
        boxShadow: 'none',
        marginBottom: 12,
    },
    container: {
        display: 'table',
    },
    topic_title: {
        backgroundColor: '#E8EAF6',
        paddingTop: 3,
        paddingBottom: 3,
    },
    topic_title_text: {
        fontSize: 17,
        margin: 0,
    },
    btn: {
        marginLeft: 10,
        paddingLeft: 10,
        paddingRight: 10,
        minHeight: 0,
        minWidth: 0,
    },
}

export default class Topic extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
        };
    }

    handleExpandChange = (expend) => {
        this.setState({expanded: expend});
    };

    handleIconClick = () => {
        this.setState({expanded: false});
    }

    renderTitle(){
        return (
            <div>
                <Chip text="Topic"/>
                {this.props.topicPost.topic.title}
            </div>
        );
    }

    render() {
        return (
                <Card expanded={this.state.expanded} onExpandChange={this.handleExpandChange} style={styles.card}>
                    <CardTitle title={this.renderTitle()}
                               actAsExpander
                               showExpandableButton
                               style={styles.topic_title}
                               titleStyle={styles.topic_title_text}
                    />
                    <Divider/>
                    <CardActions expandable>
                        <FlatButton label="View all posts in topic"
                                    href={`/courses/${this.props.course.id}/forums/${this.props.forum.id}/topics/${this.props.topicPost.topic.id}`}
                                    target="_blank"
                                    backgroundColor="#FBE9E7"
                                    labelPosition="before"
                                    primary
                                    icon={<FontIcon className="fa fa-external-link"/>}
                        />
                    </CardActions>
                    <Divider/>
                    <CardText expandable>
                        <div style={styles.container}>
                            {
                                this.props.topicPost.posts && this.props.topicPost.posts.map((post) => (
                                    <Option
                                        post={post}
                                        onToggleOption={(selected, postID) =>
                                            this.props.onToggleTopicOption(selected, postID)
                                        }
                                        qtyPostsSelected={this.props.qtyPostsSelected}
                                        maxPosts={this.props.maxPosts}
                                        key={post.post.id}
                                    />
                                ))
                            }
                        </div>
                    </CardText>
                </Card>
        );
    }
}

Topic.propTypes = {
    title: PropTypes.string,
    qtyPostsSelected: PropTypes.number,
    maxPosts: PropTypes.number,
    onToggleTopicOption: PropTypes.func,
    topicPost: PropTypes.object,
}

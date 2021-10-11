import React from "react";
import PropTypes from "prop-types";

import {Card, CardTitle, CardText, CardActions} from 'material-ui/Card';
import FlatButton from "material-ui/FlatButton";
import FontIcon from "material-ui/FontIcon";
import Divider from 'material-ui/Divider';

import Topic from './Topic';
import Chip from './Chip';

const styles = {
    card: {
        border: '1px solid #888',
        boxShadow: 'none',
        marginBottom: 12,
    },
    container: {
        display: 'table',
        width: '100%',
    },
    topic_title: {
        backgroundColor: '#BBDEFB',
        paddingTop: 3,
        paddingBottom: 3,
    },
    topic_title_text: {
        fontSize: 17,
        margin: 0,
    },
}

export default class Forum extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: false,
        };
    }

    handleExpandChange = (expend) => {
        this.setState({expanded: expend});
    };

    renderTitle(){
        return (
            <div>
                <Chip text="Forum"/>
                {this.props.topicPosts.forum.name}
            </div>
        );
    }

    render(){
        return (
            <div>
                <Card expanded={this.state.expanded} onExpandChange={this.handleExpandChange} style={styles.card}>
                    <CardTitle title={this.renderTitle()}
                               actAsExpander
                               showExpandableButton
                               style={styles.topic_title}
                               titleStyle={styles.topic_title_text}
                    />
                    <Divider/>
                    <CardActions expandable>
                        <FlatButton label="View all topics in forum"
                                    href={`/courses/${this.props.course.id}/forums/${this.props.topicPosts.forum.id}`}
                                    target="_blank"
                                    backgroundColor="#FFF8E1"
                                    labelPosition="before"
                                    primary
                                    icon={<FontIcon className="fa fa-external-link"/>}
                        />
                    </CardActions>
                    <Divider/>
                    <CardText expandable>
                        <div style={styles.container}>
                            {
                                this.props.topicPosts.topicPosts && this.props.topicPosts.topicPosts.map((topicPost) => (
                                    <Topic
                                        topicPost={topicPost}
                                        course={this.props.course}
                                        forum={this.props.topicPosts.forum}
                                        onToggleTopicOption={(selected, postID) =>
                                            this.props.onToggleTopicOption(selected, postID)
                                        }
                                        qtyPostsSelected={this.props.qtyPostsSelected}
                                        maxPosts={this.props.maxPosts}
                                        key={topicPost.topic.id}
                                    />
                                ))
                            }
                        </div>
                    </CardText>
                </Card>
            </div>
        );
    }
}

Forum.propTypes = {
    topicPosts: PropTypes.object,
};

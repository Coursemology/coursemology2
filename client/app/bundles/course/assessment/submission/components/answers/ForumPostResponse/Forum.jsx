import React from "react";
import PropTypes from "prop-types";

import {Card, CardTitle, CardText, CardActions} from 'material-ui/Card';
import FlatButton from "material-ui/FlatButton";
import FontIcon from "material-ui/FontIcon";
import Divider from 'material-ui/Divider';

import {forumTopicPostPackShape} from "course/assessment/submission/propTypes";
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
        fontSize: 15,
        margin: 0,
    },
}

export default class Forum extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: this.props.isExpanded,
        };
    }

    handleExpandChange = (expend) => {
        this.setState({expanded: expend});
    };

    isExpanded(topicPostpack) {
        let matched = false;
        topicPostpack.postpacks.forEach(postpack => {
            if (this.props.selectedPostIds.includes(postpack.corePost.id)) {
                matched = true;
            }
        })
        return matched;
    }

    renderTitle() {
        return (
            <div>
                <Chip text="Forum"/>
                {this.props.forumTopicPostpack.forum.name}
            </div>
        );
    }

    render() {
        const forumTopicPostpack = this.props.forumTopicPostpack;
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
                                    href={`/courses/${forumTopicPostpack.course.id}/forums/${forumTopicPostpack.forum.id}`}
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
                                forumTopicPostpack.topicPostpacks &&
                                forumTopicPostpack.topicPostpacks.map(topicPostpack => (
                                    <Topic
                                        topicPostpack={topicPostpack}
                                        selectedPostIds={this.props.selectedPostIds}
                                        courseId={this.props.forumTopicPostpack.course.id}
                                        forumId={this.props.forumTopicPostpack.forum.id}
                                        onSelectPostpack={
                                            (postpackSelected, isSelected) =>
                                                this.props.onSelectPostpack(postpackSelected, isSelected)
                                        }
                                        isExpanded={this.isExpanded(topicPostpack)}
                                        key={topicPostpack.topic.id}
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
    forumTopicPostpack: forumTopicPostPackShape,
    selectedPostIds: PropTypes.arrayOf(PropTypes.number),
    onSelectPostpack: PropTypes.func,
    isExpanded: PropTypes.bool,
};

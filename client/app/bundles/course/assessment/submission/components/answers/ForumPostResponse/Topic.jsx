import React from "react";
import PropTypes from "prop-types";

import {Card, CardTitle, CardText, CardActions} from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import Chip from './Chip';
import Option from './Option';
import {topicOverviewShape, postPackShape} from "course/assessment/submission/propTypes";

const styles = {
    card: {
        border: '1px solid #ccc',
        boxShadow: 'none',
        marginBottom: 12,
    },
    container: {
        display: 'table',
    },
    topicTitle: {
        backgroundColor: '#E8EAF6',
        paddingTop: 3,
        paddingBottom: 3,
    },
    topicTitleText: {
        fontSize: 15,
        margin: 0,
    },
}

export default class Topic extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            expanded: this.props.isExpanded,
        };
    }

    handleExpandChange = (expend) => {
        this.setState({expanded: expend});
    };

    renderTitle() {
        return (
            <div>
                <Chip text="Topic"/>
                {this.props.topicPostpack.topic.title}
            </div>
        );
    }

    render() {
        const topicPostpack = this.props.topicPostpack
        const courseId = this.props.courseId
        const forumId = this.props.forumId
        return (
            <Card expanded={this.state.expanded} onExpandChange={this.handleExpandChange} style={styles.card}>
                <CardTitle title={this.renderTitle()}
                           actAsExpander
                           showExpandableButton
                           style={styles.topicTitle}
                           titleStyle={styles.topicTitleText}
                />
                <Divider/>
                <CardActions expandable>
                    <FlatButton label="View all posts in topic"
                                href={`/courses/${courseId}/forums/${forumId}/topics/${topicPostpack.topic.id}`}
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
                            topicPostpack.postpacks && topicPostpack.postpacks.map((postpack) => (
                                <Option
                                    postpack={postpack}
                                    isSelected={this.props.selectedPostIds.includes(postpack.corePost.id)}
                                    onSelectPostpack={
                                        (postpackSelected, isSelected) =>
                                            this.props.onSelectPostpack(postpackSelected, isSelected)
                                    }
                                    key={postpack.corePost.id}
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
    topicPostpack: PropTypes.shape({
        topic: topicOverviewShape,
        postpacks: PropTypes.arrayOf(postPackShape),
    }),
    selectedPostIds: PropTypes.arrayOf(PropTypes.number),
    onSelectPostpack: PropTypes.func,
    courseId: PropTypes.number,
    forumId: PropTypes.number,
    isExpanded: PropTypes.bool,
}

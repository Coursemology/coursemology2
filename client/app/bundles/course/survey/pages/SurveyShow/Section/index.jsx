/* eslint-disable new-cap */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DropTarget } from 'react-dnd';
import { draggableTypes } from 'course/survey/constants';
import { changeSection } from 'course/survey/actions/questions';
import SectionCard from './SectionCard';

class Section extends React.Component {
  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
  }

  render() {
    return this.props.connectDropTarget(
      <div ref={(node) => { this.DOMNode = node; }}>
        <SectionCard {...this.props} />
      </div>
    );
  }
}

function collect(connector) {
  return {
    connectDropTarget: connector.dropTarget(),
  };
}

const sectionTarget = {
  hover(props, monitor, component) {
    const {
      index: sourceIndex,
      sectionIndex: sourceSectionIndex,
      sectionId: sourceSectionId,
    } = props.survey.draggedQuestion;
    const hoverSectionIndex = props.index;
    const hoverSectionId = props.section.id;

    // Only handle questions cards that are dragged in from other sections
    if (sourceSectionId === hoverSectionId) { return; }

    // Determine whether question is being dragged in from the section above or the one below
    let moveDownwards;
    const pointerPosition = monitor.getClientOffset();
    const hoverBoundingRect = component.DOMNode.getBoundingClientRect();
    const fromAbove =
      sourceSectionIndex < hoverSectionIndex && pointerPosition.y > hoverBoundingRect.top;
    const fromBelow =
      sourceSectionIndex > hoverSectionIndex && pointerPosition.y < hoverBoundingRect.bottom;
    if (fromAbove) {
      moveDownwards = true;
    } else if (fromBelow) {
      moveDownwards = false;
    } else {
      return;
    }

    props.dispatch(changeSection(
      moveDownwards,
      sourceIndex,
      sourceSectionIndex,
      hoverSectionIndex
    ));
  },
};

export default connect()(
  DropTarget(draggableTypes.QUESTION, sectionTarget, collect)(Section)
);

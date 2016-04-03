# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Conditional::SatisfiabilityGraphBuildService do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:course) { create(:course) }
    let!(:achievement) { create(:achievement, course: course) }
    let!(:assessment) { create(:assessment, course: course) }

    describe '.build' do
      subject { Course::Conditional::SatisfiabilityGraphBuildService.build(course) }

      it 'cache the satisfiability graph for the course' do
        graph = instance_double(Course::Conditional::UserSatisfiabilityGraph)
        expect(Course::Conditional::UserSatisfiabilityGraph).to receive(:new).
          with(contain_exactly(assessment, achievement)).and_return(graph)
        # TODO: Expect the newly build satisfiability graph to be cached
        expect(subject).to eq(graph)
      end
    end

    describe '#build' do
      subject { Course::Conditional::SatisfiabilityGraphBuildService.new }

      it 'returns the satisfiability graph for the course' do
        graph = instance_double(Course::Conditional::UserSatisfiabilityGraph)
        expect(Course::Conditional::UserSatisfiabilityGraph).to receive(:new).
          with(contain_exactly(assessment, achievement)).and_return(graph)
        expect(subject.build(course)).to eq(graph)
      end
    end
  end
end

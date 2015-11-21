require 'rails_helper'

RSpec.describe Course::Assessment::Question::ProgrammingController do
  let(:instance) { create(:instance) }
  with_tenant(:instance) do
    let(:programming_question) { nil }
    let(:user) { create(:user) }
    let(:course) { create(:course, creator: user) }
    let(:assessment) { create(:assessment, course: course) }
    let(:immutable_programming_question) do
      create(:course_assessment_question_programming, assessment: assessment).tap do |question|
        allow(question).to receive(:save).and_return(false)
        allow(question).to receive(:destroy).and_return(false)
      end
    end

    before do
      sign_in(user)
      return unless programming_question
      controller.instance_variable_set(:@programming_question, programming_question)
    end

    describe '#create' do
      subject do
        question_programming_attributes = attributes_for(:course_assessment_question_programming).
                                          slice(:title, :description, :maximum_grade, :language,
                                                :memory_limit, :time_limit)
        post :create, course_id: course, assessment_id: assessment,
                      question_programming: question_programming_attributes
      end

      context 'when saving fails' do
        let(:programming_question) { immutable_programming_question }
        it { is_expected.to render_template('new') }
      end
    end

    describe '#update' do
      let(:programming_question) { immutable_programming_question }
      subject do
        question_programming_attributes = attributes_for(:course_assessment_question_programming).
                                          slice(:title, :description, :maximum_grade, :language,
                                                :memory_limit, :time_limit)
        patch :update, course_id: course, assessment_id: assessment, id: programming_question,
                       question_programming: question_programming_attributes
      end

      it { is_expected.to render_template('edit') }
    end

    describe '#destroy' do
      let(:programming_question) { immutable_programming_question }
      subject do
        post :destroy, course_id: course, assessment_id: assessment, id: programming_question
      end

      it { is_expected.to redirect_to(course_assessment_path(course, assessment)) }
      it 'sets the correct flash message' do
        subject
        expect(flash[:danger]).not_to be_empty
      end
    end
  end
end

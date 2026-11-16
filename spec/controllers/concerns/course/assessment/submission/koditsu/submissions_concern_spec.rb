# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Submission::Koditsu::SubmissionsConcern do
  let!(:instance) { Instance.default }
  with_tenant(:instance) do
    let!(:admin) { create(:administrator) }
    let!(:student_one) { create(:user, name: 'Student One') }
    let!(:student_two) { create(:user, name: 'Student Two') }

    class self::DummyController < ApplicationController
      include Course::Assessment::Submission::Koditsu::SubmissionsConcern
    end

    let!(:dummy_controller) { self.class::DummyController.new }
    let!(:course) { create(:course, koditsu_workspace_id: '66fd754a3486c7994c809e16') }
    let!(:course_user_one) { create(:course_user, user: student_one, course: course) }
    let!(:course_user_two) { create(:course_user, user: student_two, course: course) }
    let!(:assessment) do
      create(:course_assessment_assessment,
             course: course,
             start_at: '2024-06-01T11:55:00.000Z',
             end_at: '2024-06-01T13:05:00.000Z',
             is_synced_with_koditsu: true,
             is_koditsu_enabled: true,
             koditsu_assessment_id: '66fa7643b97aed0e8e189633')
    end
    let(:question_test_cases) do
      public_report = File.read(question_test_public_report_path)
      public_test_cases = Course::Assessment::ProgrammingTestCaseReport.
                          new(public_report).test_cases.map do |test_case|
        Course::Assessment::Question::ProgrammingTestCase.new(identifier: test_case.identifier,
                                                              test_case_type: :public_test)
      end

      public_test_cases
    end
    let(:question_other_test_cases) do
      public_report = File.read(question_other_test_public_report_path)
      public_test_cases = Course::Assessment::ProgrammingTestCaseReport.
                          new(public_report).test_cases.map do |test_case|
        Course::Assessment::Question::ProgrammingTestCase.new(identifier: test_case.identifier,
                                                              test_case_type: :public_test)
      end

      public_test_cases
    end
    let(:question_test_public_report_path) do
      File.join(Rails.root, 'spec/fixtures/course/programming_public_test_report.xml')
    end
    let(:question_other_test_public_report_path) do
      File.join(Rails.root, 'spec/fixtures/course/programming_other_public_test_report.xml')
    end
    let!(:question_one) do
      create(:course_assessment_question_programming,
             assessment: assessment,
             maximum_grade: 10,
             is_synced_with_koditsu: true,
             test_cases: question_test_cases,
             koditsu_question_id: '66fb2e66cd0216558fde9998')
    end
    let!(:question_two) do
      create(:course_assessment_question_programming,
             assessment: assessment,
             maximum_grade: 10,
             is_synced_with_koditsu: true,
             test_cases: question_other_test_cases,
             koditsu_question_id: '66fc14477b095d84b42cc6cf')
    end

    before do
      dummy_controller.instance_variable_set(:@assessment, assessment)
      dummy_controller.instance_variable_set(:@user, admin)
    end

    context 'in fetching all submissions from Koditsu' do
      let(:response) do
        JSON.parse(
          File.read(File.join(Rails.root,
                              'spec/fixtures/course/koditsu/koditsu_submissions_response.json'))
        )
      end

      it 'updates all submissions within assessment properly' do
        # replace the user placeholder in json with the data actually used in this spec,
        # which is using given name but generated email through our FactoryBot
        response['data'][0]['user'] = {
          'name' => student_one.name,
          'email' => student_one.email
        }

        response['data'][1]['user'] = {
          'name' => student_two.name,
          'email' => student_two.email
        }

        dummy_controller.send(:process_fetch_submissions_response, response['data'])

        current_assessment = dummy_controller.instance_variable_get(:@assessment)
        submissions = current_assessment.submissions.reload

        expect(submissions.count).to eq(2)
        expect(submissions[0].workflow_state).to eq('submitted')
        expect(submissions[1].workflow_state).to eq('submitted')

        student_one_answers = submissions[0].answers
        student_two_answers = submissions[1].answers

        expect(student_one_answers[0].correct).to be_truthy
        expect(student_one_answers[1].correct).to be_falsey

        expect(student_two_answers[0].correct).to be_falsey
        expect(student_two_answers[1].correct).to be_falsey

        first_submission_time = response['data'][0]['questions'][0]['filesSavedAt']
        parsed_submission_time = DateTime.parse(first_submission_time).in_time_zone

        expect(submissions[0].submitted_at).to be_within(1.second).of parsed_submission_time
        expect(submissions[1].submitted_at).to be_within(1.second).of current_assessment.end_at
      end

      context 'when the student pressed Submit on Coursemology before the fetch' do
        let(:koditsu_code) { response['data'][0]['questions'][0]['files'][0]['content'] }
        let(:coursemology_code) { 'print("submitted on Coursemology")' }
        let!(:submission) { create(:submission, :attempting, assessment: assessment, creator: student_one) }
        let!(:current_answer) do
          answer = submission.answers.find_by!(question: question_one.acting_as, current_answer: true)
          answer.actable.files.destroy_all
          answer.actable.files.create!(filename: 'template.py', content: coursemology_code)
          answer
        end
        # What Submit does: snapshot the current answer into a newer answer, which is finalised and graded.
        let!(:past_answer) do
          answer = question_one.attempt(submission, current_answer.actable)
          answer.finalise!
          answer.save!
          Course::Assessment::Answer::ProgrammingAutoGrading.create!(answer: answer)
          answer
        end

        before do
          response['data'][0]['user'] = { 'name' => student_one.name, 'email' => student_one.email }
          response['data'][1]['user'] = { 'name' => student_two.name, 'email' => student_two.email }
        end

        def expect_koditsu_result_in_current_answer
          answer = current_answer.reload
          expect(answer.actable.files.reload.map(&:content)).to eq([koditsu_code])
          expect(answer).to be_submitted
          expect(answer.correct).to be_truthy
          auto_gradings = Course::Assessment::Answer::ProgrammingAutoGrading.where(answer: answer)
          expect(auto_gradings.size).to eq(1)
          expect(auto_gradings.first.test_results.size).to eq(5)
        end

        it 'writes the result into the current answer and leaves the past answer alone' do
          expect(submission.answers.reload.last).to eq(past_answer)
          past_auto_grading = past_answer.auto_grading

          dummy_controller.send(:process_fetch_submissions_response, response['data'])

          expect_koditsu_result_in_current_answer
          past_answer.reload
          expect(past_answer.actable.files.reload.map(&:content)).to eq([coursemology_code])
          expect(past_answer.auto_grading).to eq(past_auto_grading)
          expect(past_answer.auto_grading.actable.test_results).to be_empty
        end

        it 'replaces the result when fetched again' do
          2.times { dummy_controller.send(:process_fetch_submissions_response, response['data']) }

          expect_koditsu_result_in_current_answer
          expect(past_answer.reload.actable.files.reload.map(&:content)).to eq([coursemology_code])
        end
      end
    end
  end
end

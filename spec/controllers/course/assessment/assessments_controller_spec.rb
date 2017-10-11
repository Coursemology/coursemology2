# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::AssessmentsController do
  let!(:instance) { Instance.default }

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let!(:course) { create(:course, creator: user) }
    let(:category) { course.assessment_categories.first }
    let(:tab) { category.tabs.first }
    let!(:immutable_assessment) do
      create(:assessment, course: course).tap do |stub|
        allow(stub).to receive(:destroy).and_return(false)
      end
    end

    before { sign_in(user) }

    describe '#index' do
      context 'when a category is given' do
        before do
          post :index,
               course_id: course,
               id: immutable_assessment,
               assessment: { title: '' },
               category: category
        end
        it { expect(controller.instance_variable_get(:@category)).to eq(category) }
      end

      context 'when a tab is given' do
        before do
          post :index,
               course_id: course,
               id: immutable_assessment,
               assessment: { title: '' },
               category: category,
               tab: tab
        end
        it { expect(controller.instance_variable_get(:@tab)).to eq(tab) }
      end
    end

    describe '#update' do
      let(:student) { create(:course_student, course: course).user }
      let(:assessment) do
        create(:assessment, :published_with_mrq_question, course: course, start_at: 1.day.from_now)
      end

      context 'when update fails' do
        it 'renders JSON errors' do
          patch :update, course_id: course, id: assessment, assessment: { title: '' }

          body = JSON.parse(response.body)
          expect(body['errors']).to be_present
        end
      end

      it 'updates the start_at and end_at' do
        student

        patch :update, course_id: course, id: assessment,
                       assessment: { start_at: Time.zone.now, end_at: Time.zone.now + 1.hour }

        perform_enqueued_jobs
        wait_for_job

        emails = unread_emails_for(student.email).map(&:subject)
        opening_subject = '.notifiers.course.assessment_notifier.opening.'\
                          'course_notifications.email.subject'
        closing_subject = 'course.mailer.assessment_closing_reminder_email.subject'
        expect(emails).to include(opening_subject)
        expect(emails).to include(closing_subject)

        manager_emails = unread_emails_for(user.email).map(&:subject)
        reminder_subject = 'course.mailer.assessment_closing_summary_email.subject'
        expect(manager_emails).to include(reminder_subject)
      end

      context 'when the assessment is autograded' do
        let(:assessment) { create(:assessment, :autograded, course: course) }
        it 'does not update attributes tabbed_view and password' do
          patch :update, course_id: course, id: assessment,
                         assessment: { skippable: true, tabbed_view: true, password: 'password' }

          expect(assessment).not_to be_skippable
          assessment.reload

          expect(assessment).to be_skippable
          expect(assessment.tabbed_view).to be_falsy
          expect(assessment.password).to be_blank
        end
      end

      context 'when the assessment is not autograded' do
        let(:assessment) { create(:assessment, course: course) }
        it 'does not update attribute skippable' do
          patch :update, course_id: course, id: assessment,
                         assessment: { skippable: true, tabbed_view: true, password: 'password' }

          expect(assessment).not_to be_skippable
          expect(assessment.tabbed_view).not_to be_truthy
          expect(assessment.password).not_to be_present
          assessment.reload

          expect(assessment).not_to be_skippable
          expect(assessment.tabbed_view).to be_truthy
          expect(assessment.password).to be_present
        end
      end
    end

    describe '#destroy' do
      subject { delete :destroy, course_id: course, id: immutable_assessment }

      context 'when destroy fails' do
        before { controller.instance_variable_set(:@assessment, immutable_assessment) }

        it 'redirects with a flash message' do
          expect(subject).to redirect_to(course_assessment_path(course, immutable_assessment))
          expect(flash[:danger]).to eq(I18n.t('course.assessment.assessments.destroy.failure'))
        end
      end
    end

    describe '#add_assessment_breadcrumbs' do
      let(:breadcrumbs) { controller.send(:breadcrumb_names) }
      let(:tabs) { 1 }
      before do
        create_list(:course_assessment_tab, tabs - 1,
                    category: course.assessment_categories.first)
        get :index, course_id: course.id
      end

      context 'when the category has one tab' do
        it 'only displays the category' do
          expect(breadcrumbs).to include(course.assessment_categories.first.title)
          expect(breadcrumbs).not_to include(course.assessment_categories.first.tabs.first.title)
        end
      end

      context 'when the category has more than one tab' do
        let(:tabs) { 2 }
        it 'also displays the tab' do
          expect(breadcrumbs).to include(course.assessment_categories.first.title)
          expect(breadcrumbs).to include(course.assessment_categories.first.tabs.first.title)
        end
      end
    end

    describe '#reorder' do
      let!(:questions) do
        create_list(:course_assessment_question, 2, assessment: immutable_assessment)
      end

      context 'when a valid ordering is given' do
        let(:reversed_order) { immutable_assessment.questions.map(&:id).reverse }

        before do
          post :reorder, format: :js, course_id: course, id: immutable_assessment,
                         question_order: reversed_order.map(&:to_s)
        end

        it 'reorders questions' do
          expect(immutable_assessment.questions.order(:weight).pluck(:id)).to eq(reversed_order)
        end
      end

      context 'when an invalid ordering is given' do
        subject do
          post :reorder, format: :js, course_id: course, id: immutable_assessment,
                         question_order: [questions.first.id]
        end

        it 'raises ArgumentError' do
          expect { subject }.
            to raise_error(ArgumentError, 'Invalid ordering for assessment questions')
        end
      end
    end
  end
end

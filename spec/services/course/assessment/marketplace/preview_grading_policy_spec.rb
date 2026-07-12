# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Assessment::Marketplace::PreviewGradingPolicy do
  let(:instance) { create(:instance) }
  around { |ex| ActsAsTenant.with_tenant(instance) { ex.run } }

  let(:course) { create(:course, instance: instance) }
  let(:assessment) { create(:assessment, :published, course: course) }

  # Mark the assessment as a marketplace preview copy, the way PreviewCopyService does.
  def mark_as_preview_copy!
    source = create(:assessment, :published, course: create(:course, instance: instance))
    listing = create(:course_assessment_marketplace_listing, assessment: source)
    manager = create(:course_manager, course: course)
    Course::Assessment::Marketplace::Preview.create!(listing: listing, course_user: manager, assessment: assessment)
    assessment.reload
  end

  describe '.inert?' do
    context 'in a marketplace preview copy' do
      before { mark_as_preview_copy! }

      it 'is inert for a Codaveri programming question (the paid grader)' do
        question = create(:course_assessment_question_programming, assessment: assessment,
                                                                   with_codaveri_question: true)
        expect(described_class.inert?(assessment, question.acting_as)).to be(true)
      end

      it 'is inert for a rubric-based question (the paid LLM grader)' do
        question = create(:course_assessment_question_rubric_based_response, assessment: assessment)
        expect(described_class.inert?(assessment, question.acting_as)).to be(true)
      end

      it 'is NOT inert for a plain programming question — the free evaluator still runs' do
        question = create(:course_assessment_question_programming, assessment: assessment)
        expect(described_class.inert?(assessment, question.acting_as)).to be(false)
      end

      it 'is NOT inert for a multiple-response question' do
        question = create(:course_assessment_question_multiple_response, assessment: assessment)
        expect(described_class.inert?(assessment, question.acting_as)).to be(false)
      end
    end

    context 'in an ordinary (non-preview) course' do
      it 'is NOT inert for a Codaveri question — real submissions still get the paid grader' do
        question = create(:course_assessment_question_programming, assessment: assessment,
                                                                   with_codaveri_question: true)
        expect(described_class.inert?(assessment, question.acting_as)).to be(false)
      end
    end
  end

  describe '.any_paid_grader?' do
    # Copy-independent by design: it inspects question TYPES, so it is asked of a listing's *source*
    # assessment (never itself a preview copy). No preview marker is set up here on purpose.
    it 'is true when the assessment has a Codaveri programming question' do
      create(:course_assessment_question_programming, assessment: assessment, with_codaveri_question: true)
      expect(described_class.any_paid_grader?(assessment)).to be(true)
    end

    it 'is true when the assessment has a rubric-based question' do
      create(:course_assessment_question_rubric_based_response, assessment: assessment)
      expect(described_class.any_paid_grader?(assessment)).to be(true)
    end

    it 'is true when at least one of several questions is a paid grader' do
      create(:course_assessment_question_multiple_response, assessment: assessment)
      create(:course_assessment_question_rubric_based_response, assessment: assessment)
      expect(described_class.any_paid_grader?(assessment)).to be(true)
    end

    it 'is false when the assessment has only free-evaluator questions' do
      create(:course_assessment_question_multiple_response, assessment: assessment)
      create(:course_assessment_question_programming, assessment: assessment)
      expect(described_class.any_paid_grader?(assessment)).to be(false)
    end

    it 'is false for an assessment with no questions' do
      expect(described_class.any_paid_grader?(assessment)).to be(false)
    end
  end
end

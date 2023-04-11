# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Discussion::Post::CodaveriFeedbackRatingService do
  let!(:instance) { create(:instance, :with_codaveri_component_enabled) }
  let!(:stubbed_connection) do
    Course::Discussion::Post::StubbedCodaveriFeedbackRatingService.connect_to_codaveri
  end
  let!(:stubbed_failed_connection) do
    Course::Discussion::Post::StubbedCodaveriFeedbackRatingServiceFailed.connect_to_codaveri
  end

  with_tenant(:instance) do
    let(:user) { create(:user) }
    let(:post) { create(:course_discussion_post) }
    let(:codaveri_feedback) do
      create(:course_discussion_post_codaveri_feedback, post: post, rating: rating, status: status)
    end
    let(:status) { :accepted }
    let(:rating) { 5 }

    subject { Course::Discussion::Post::CodaveriFeedbackRatingService.send_feedback(codaveri_feedback) }
    describe '.send_feedback succeeds' do
      before do
        allow_any_instance_of(Course::Discussion::Post::CodaveriFeedbackRatingService).to\
          receive(:connect_to_codaveri).and_return(stubbed_connection)
      end

      it 'sends rating to codaveri' do
        expect(subject).to eq('Rating successfully sent!')
      end
    end

    describe '.send_feedback fails' do
      before do
        allow_any_instance_of(Course::Discussion::Post::CodaveriFeedbackRatingService).to\
          receive(:connect_to_codaveri).and_return(stubbed_failed_connection)
      end

      it 'does not send rating to codaveri' do
        expect(subject).to eq(false)
      end
    end
  end
end

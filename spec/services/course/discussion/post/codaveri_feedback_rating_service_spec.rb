# frozen_string_literal: true
require 'rails_helper'

RSpec.describe Course::Discussion::Post::CodaveriFeedbackRatingService do
  let!(:instance) { create(:instance) }
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
      it 'sends rating to codaveri' do
        allow_any_instance_of(CodaveriApiService).to receive(:connect_to_codaveri).
          and_return(Course::Discussion::Post::StubbedCodaveriFeedbackRatingService.connect_to_codaveri)
        expect(subject).to eq('Rating successfully sent!')
      end
    end

    describe '.send_feedback fails' do
      it 'does not send rating to codaveri' do
        allow_any_instance_of(CodaveriApiService).to receive(:connect_to_codaveri).
          and_return(Course::Discussion::Post::StubbedCodaveriFeedbackRatingServiceFailed.connect_to_codaveri)
        expect { subject }.to raise_error(CodaveriError)
      end
    end
  end
end

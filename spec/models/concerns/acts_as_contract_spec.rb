# frozen_string_literal: true
require 'rails_helper'

# Pins the behaviours Coursemology relies on from the self-maintained `active_record-acts_as` fork
# (github.com/Coursemology/active_record-acts_as). Per-model specs cover domain logic but assert the
# gem's contract only implicitly; this spec makes delegation, create-time autosave, destroy-cascade,
# and the live `touch: true` propagation explicit, so a gem change (reconciling with upstream, or a
# Rails upgrade) can't silently regress them. The gem's own suite covers the deeper save-through
# matrix; here we guard the app-facing behaviour on real Coursemology models.
#
# Uses the Answer MTI pair: `Course::Assessment::Answer` is the parent, and
# `Course::Assessment::Answer::TextResponse` is its actable (the `acts_as` model returned by
# `parent.actable` / `#specific`).
RSpec.describe 'active_record-acts_as contract', type: :model do
  include ActiveSupport::Testing::TimeHelpers

  let(:instance) { Instance.default }
  with_tenant(:instance) do
    subject(:actable) { create(:course_assessment_answer_text_response) }
    let(:parent) { actable.answer }

    describe 'MTI wiring' do
      it 'persists both the actable and its parent on create' do
        expect(actable).to be_persisted
        expect(parent).to be_persisted
        expect(parent.actable).to eq(actable)
      end

      it 'exposes the actable from the parent via #specific' do
        expect(parent.specific).to eq(actable)
      end
    end

    describe 'delegation (acts_as)' do
      it 'delegates parent attributes/associations to the actable' do
        # `submission` and `question` live on the Answer parent; the actable delegates to them.
        expect(actable.submission).to eq(parent.submission)
        expect(actable.question).to eq(parent.question)
      end

      it 'reports #acting_as? for the parent class' do
        expect(actable.acting_as?(Course::Assessment::Answer)).to be(true)
      end
    end

    describe 'destroy cascade' do
      it 'destroys the actable when the parent is destroyed (dependent: :destroy)' do
        actable # create
        expect { parent.destroy }.
          to change { Course::Assessment::Answer::TextResponse.exists?(actable.id) }.from(true).to(false)
      end

      it 'destroys the parent when the actable is destroyed (after_destroy)' do
        id = parent.id
        expect { actable.destroy }.
          to change { Course::Assessment::Answer.exists?(id) }.from(true).to(false)
      end
    end

    describe 'touch propagation (Course::Discussion::Post belongs_to :topic, touch: true)' do
      it "bumps the topic's updated_at when a post is saved" do
        post = build(:course_discussion_post)
        topic = post.topic
        topic.save!
        original = topic.reload.updated_at

        travel_to(2.minutes.from_now) { post.save! }

        expect(topic.reload.updated_at).to be > original
      end
    end
  end
end

# frozen_string_literal: true
require 'rails_helper'

RSpec.describe TrackableJob do
  class self::NoOpJob < ActiveJob::Base
    include TrackableJob
  end

  class self::ExampleJob < self::NoOpJob
    protected

    def perform_tracked
    end
  end

  describe TrackableJob::Job, type: :model do
    subject { TrackableJob::Job.new }

    def self.validate_absence_of_error
      it 'validates absence of :error' do
        subject.error = { message: '' }
        expect(subject.valid?).to be(false)
        expect(subject.errors[:error]).not_to be_empty
      end
    end

    it { is_expected.to validate_absence_of(:redirect_to) }
    validate_absence_of_error

    context 'when the job is completed' do
      before { subject.status = :completed }

      it { is_expected.not_to validate_absence_of(:redirect_to) }
      validate_absence_of_error
    end

    context 'when the job is errored' do
      before { subject.status = :errored }

      it { is_expected.not_to validate_absence_of(:redirect_to) }
      it 'does not validate absence of :error' do
        subject.error = { message: '' }
        expect(subject.valid?).to be(true)
      end
    end

    describe '#save' do
      context 'when the job is finished' do
        it 'notifies listeners' do
          subject.id = SecureRandom.uuid
          subject.save!
          subject.status = :completed
          Thread.new { ActiveRecord::Base.connection_pool.with_connection { subject.save } }
          subject.wait

          # This should not deadlock because saving the record should signal.
        end
      end

      context 'when the job was already completed' do
        it 'does not notify listeners' do
          subject.update(id: SecureRandom.uuid, status: :completed)

          expect(subject).not_to receive(:signal)
          subject.update(redirect_to: '')
        end
      end
    end
  end

  subject { self.class::ExampleJob.perform_later }

  context 'when a new job is created' do
    it 'has a submitted state' do
      expect(subject.job.status).to eq('submitted')
    end

    it 'is persisted to the database' do
      expect(TrackableJob::Job.find(subject.job_id)).to eq(subject.job)
    end

    it 'only creates one job' do
      expect { subject }.to change { TrackableJob::Job.count }.by(1)
    end
  end

  context 'when the job is completed' do
    before { subject.perform_now }
    it 'transitions to the completed state' do
      expect(subject.job.status).to eq('completed')
    end
  end

  context 'when the job has an error' do
    let(:error_to_throw) { StandardError }
    before do
      error_to_throw = self.error_to_throw
      subject.define_singleton_method(:perform_tracked) do
        raise error_to_throw
      end

      subject.perform_now
    end

    it 'transitions to the errored state' do
      expect(subject.job.status).to eq('errored')
    end

    it 'has the error' do
      expect(subject.job.error).to be_present
    end

    context 'when the error defines #as_json' do
      let(:error_to_throw) { self.class::MyError }
      class self::MyError < StandardError
        def to_h
          { test: 'message' }
        end
      end

      it 'includes the json properties' do
        expect(subject.job.error).to have_key('test')
      end
    end
  end

  describe '#wait' do
    it 'waits for the job to finish' do
      expect(subject.job).to be_submitted
      subject.wait

      subject.job.reload
      expect(subject.job).to be_completed
    end

    context 'when waiting for a completed job' do
      it 'does not block' do
        job_id = subject.job_id
        subject.wait

        subject.job.reload
        expect(subject.job_id).to eq(job_id)
        expect(subject.job).to be_completed
        subject.wait
      end
    end
  end

  describe '#perform_tracked' do
    with_active_job_queue_adapter(:inline) do
      subject { self.class::NoOpJob.perform_later }

      it 'fails with NotImplementedError' do
        expect { subject.send(:perform_tracked) }.to raise_error(NotImplementedError)
      end
    end
  end

  describe '#job_id=' do
    it 'fetches the job' do
      expect(ActiveJob::Base.deserialize(subject.serialize).job).to eq(subject.job)
    end
  end

  describe '#redirect_to' do
    let(:redirect_to_path) { '/' }
    it 'sets the #redirect_to attribute of the job' do
      subject.send(:redirect_to, redirect_to_path)
      expect(subject.job.redirect_to).to eq(redirect_to_path)
    end
  end
end

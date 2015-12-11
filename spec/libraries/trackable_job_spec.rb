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
  end

  subject { self.class::ExampleJob.perform_later }

  context 'when a new job is created' do
    it 'has a submitted state' do
      expect(subject.job.status).to eq('submitted')
    end

    it 'is persisted to the database' do
      expect(TrackableJob::Job.find(subject.job_id)).to eq(subject.job)
    end
  end

  context 'when the job is completed' do
    before { subject.perform_now }
    it 'transitions to the completed state' do
      expect(subject.job.status).to eq('completed')
    end
  end

  context 'when the job has an error' do
    before do
      def subject.perform_tracked
        fail
      end

      subject.perform_now
    end

    it 'transitions to the errored state' do
      expect(subject.job.status).to eq('errored')
    end

    it 'has the error' do
      expect(subject.job.error).to be_present
    end
  end

  describe '#perform_tracked' do
    subject { self.class::NoOpJob.perform_later }

    it 'fails with NotImplementedError' do
      expect { subject.perform_tracked }.to raise_error(NotImplementedError)
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

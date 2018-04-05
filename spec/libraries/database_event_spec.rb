# frozen_string_literal: true
require 'rails_helper'

RSpec.describe 'Extensions: Database Event' do
  subject { Instance.default }

  self::NOTIFICATION = 'database_event_test'

  def signal
    Thread.new do
      ActiveRecord::Base.connection_pool.with_connection do
        ActiveRecord::Base.signal(self.class::NOTIFICATION)
      end
    end
  end

  describe '.wait' do
    context 'when a timeout is specified' do
      context 'when the timeout elapses without a signal' do
        it 'returns nil' do
          expect(ActiveRecord::Base.wait(self.class::NOTIFICATION, timeout: 0)).to be_nil
        end
      end
    end

    context 'when a timeout is not specified' do
      it 'returns the notification event notified' do
        signal
        expect(ActiveRecord::Base.wait(self.class::NOTIFICATION)).to eq(self.class::NOTIFICATION)
      end
    end

    context 'when a while_callback is specified' do
      it 'is called' do
        count = 0
        callback = lambda do
          count += 1
          false
        end

        expect do
          ActiveRecord::Base.wait(self.class::NOTIFICATION, while_callback: callback)
        end.to change { count }.by(1)
      end

      context 'when the callback returns false on the first time' do
        it 'returns false' do
          expect(ActiveRecord::Base.wait(self.class::NOTIFICATION,
                                         while_callback: -> { false })).to be(false)
        end
      end

      context 'when the callback returns false on subsequent times' do
        context 'when no notification was received' do
          it 'returns nil' do
            count = 0
            callback = lambda do
              count += 1
              count == 1
            end

            expect(ActiveRecord::Base.wait(self.class::NOTIFICATION,
                                           timeout: 1.second,
                                           while_callback: callback)).to be_nil
          end
        end

        context 'when a notification was received' do
          it 'returns the notification' do
            count = 0
            callback = lambda do
              count += 1
              count == 1
            end

            signal
            expect(ActiveRecord::Base.wait(self.class::NOTIFICATION,
                                           while_callback: callback)).to \
                                             eq(self.class::NOTIFICATION)
          end
        end
      end
    end
  end

  describe '#wait' do
    it 'respects the timeout' do
      expect(subject.wait(timeout: 0)).to be_nil
    end

    it 'respects the while_callback' do
      expect(subject.wait(while_callback: -> { false })).to be(false)
    end

    it 'automatically generates a notification identifier' do
      expect(subject).to receive(:notify_identifier).and_call_original
      subject.wait(timeout: 0)
    end
  end

  describe '#signal' do
    it 'automatically generates a notification identifier' do
      expect(subject).to receive(:notify_identifier).and_call_original
      subject.signal
    end
  end
end

# frozen_string_literal: true
FactoryBot.define do
  factory :course_video_session, class: Course::Video::Session.name,
                                 aliases: [:video_session] do
    transient do
      course { build(:course, :with_video_component_enabled) }
      video { build(:video, :published, course: course) }
      student { create(:course_student, course: course) }
    end

    submission do
      build(:video_submission, video: video, creator: student.user, course_user: student)
    end

    creator { student.user }
    updater { creator }

    session_start { Time.zone.now - 5.minutes }
    session_end { Time.zone.now + 5.minutes }

    last_video_time { 0 }

    # Series of watch intervals with pauses after each interval
    # The intervals should be [[0, 20], [39, 70], [10, 25]]
    trait :with_events_paused do
      after(:build) do |session|
        session.events << build(:video_event, sequence_num: 1, event_type: 'play',
                                              video_time: 0)
        session.events << build(:video_event, sequence_num: 2, event_type: 'pause',
                                              video_time: 20)
        session.events << build(:video_event, sequence_num: 3, event_type: 'seek_start',
                                              video_time: 20)
        session.events << build(:video_event, sequence_num: 4, event_type: 'buffer',
                                              video_time: 17)
        session.events << build(:video_event, sequence_num: 5, event_type: 'seek_end',
                                              video_time: 39)
        session.events << build(:video_event, sequence_num: 6, event_type: 'play',
                                              video_time: 39)
        session.events << build(:video_event, sequence_num: 7, event_type: 'end',
                                              video_time: 70)
        session.events << build(:video_event, sequence_num: 8, event_type: 'seek_start',
                                              video_time: 70)
        session.events << build(:video_event, sequence_num: 9, event_type: 'buffer',
                                              video_time: 67)
        session.events << build(:video_event, sequence_num: 10, event_type: 'seek_end',
                                              video_time: 10)
        session.events << build(:video_event, sequence_num: 11, event_type: 'play',
                                              video_time: 10)
        session.events << build(:video_event, sequence_num: 12, event_type: 'pause',
                                              video_time: 25)
        session.last_video_time = 25
      end
    end

    # Series of watch intervals without pauses after each interval
    # The intervals should be [[0, 5], [30, 50], [19, 37]]
    trait :with_events_continuous do
      after(:build) do |session|
        session.events << build(:video_event, sequence_num: 1, event_type: 'play',
                                              video_time: 0)
        session.events << build(:video_event, sequence_num: 2, event_type: 'seek_start',
                                              video_time: 5)
        session.events << build(:video_event, sequence_num: 3, event_type: 'buffer',
                                              video_time: 17)
        session.events << build(:video_event, sequence_num: 4, event_type: 'seek_end',
                                              video_time: 30)
        session.events << build(:video_event, sequence_num: 5, event_type: 'play',
                                              video_time: 30)
        session.events << build(:video_event, sequence_num: 6, event_type: 'seek_start',
                                              video_time: 50)
        session.events << build(:video_event, sequence_num: 7, event_type: 'buffer',
                                              video_time: 18)
        session.events << build(:video_event, sequence_num: 8, event_type: 'seek_end',
                                              video_time: 19)
        session.events << build(:video_event, sequence_num: 9, event_type: 'play',
                                              video_time: 20)
        session.events << build(:video_event, sequence_num: 10, event_type: 'buffer',
                                              video_time: 24)
        session.events << build(:video_event, sequence_num: 11, event_type: 'play',
                                              video_time: 24)
        session.events << build(:video_event, sequence_num: 12, event_type: 'speed_change',
                                              video_time: 30, playback_rate: 1.5)
        session.last_video_time = 37
      end
    end

    # Series of watch intervals with unclosed start
    # The intervals should be [[0, 30], [39, 45]]
    trait :with_events_unclosed do
      after(:build) do |session|
        session.events << build(:video_event, sequence_num: 1, event_type: 'play',
                                              video_time: 0)
        session.events << build(:video_event, sequence_num: 2, event_type: 'pause',
                                              video_time: 30)
        session.events << build(:video_event, sequence_num: 3, event_type: 'seek_start',
                                              video_time: 30)
        session.events << build(:video_event, sequence_num: 4, event_type: 'buffer',
                                              video_time: 30)
        session.events << build(:video_event, sequence_num: 5, event_type: 'seek_end',
                                              video_time: 39)
        session.events << build(:video_event, sequence_num: 6, event_type: 'play',
                                              video_time: 39)
        session.last_video_time = 45
      end
    end

    # Series of watch intervals where user presses play again after video ended
    # then closes window at 4s
    # The intervals should be [[0, 70], [0, 4]]
    trait :with_events_replay do
      after(:build) do |session|
        session.events << build(:video_event, sequence_num: 1, event_type: 'play',
                                              video_time: 0)
        session.events << build(:video_event, sequence_num: 2, event_type: 'end',
                                              video_time: 70)
        session.events << build(:video_event, sequence_num: 3, event_type: 'play',
                                              video_time: 70)
        session.events << build(:video_event, sequence_num: 4, event_type: 'buffer',
                                              video_time: 70)
        session.last_video_time = 4
      end
    end
  end
end

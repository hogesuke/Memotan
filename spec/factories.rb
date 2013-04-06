# coding: utf-8

FactoryGirl.define do
  factory :word_1, :class => Word do |f|
    f.spelling "spell-1"
    f.description "description-1"
    f.user_id {FactoryGirl.create(:user_1)}
    f.learning_level_id {FactoryGirl.create(:level_1)}
    f.last_learned_at "2012-01-01"
    f.last_level_changed_at "2012-01-01"
    f.created_at "2012-01-01"
    f.updated_at "2012-01-01"
    f.tags {[FactoryGirl.create(:tag_1)]}
  end
  
  factory :user_1, :class => User do |f|
    f.username "user1"
    f.password "pass"
    f.email "mail@gmail.com"
    f.dm "true"
    f.roles "member"
    f.created_at "2012-01-01"
    f.updated_at "2012-01-01"
  end
  
  factory :level_1, :class => LearningLevel do |f|
    f.label "Level1"
    f.level 1
    f.created_at "2012-01-01"
    f.updated_at "2012-01-01"
  end
  
  factory :level_2, :class => LearningLevel do |f|
    f.label "Level2"
    f.level 2
    f.created_at "2012-01-01"
    f.updated_at "2012-01-01"
  end
  
  factory :level_3, :class => LearningLevel do |f|
    f.label "Level3"
    f.level 3
    f.created_at "2012-01-01"
    f.updated_at "2012-01-01"
  end
  
  factory :tag_1, :class => Tag do |f|
    f.label "タグ1"
    f.user_id {FactoryGirl.create(:user_1)}
    f.created_at "2012-01-01"
    f.updated_at "2012-01-01"
  end
end
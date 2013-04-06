class LearningLevel < ActiveRecord::Base
  
  has_many :words
  
  validates :level,
    :presence => true,
    :uniqueness => true,
    :format => { :with => /^[1-9]{1}$/}
    
  validates :label,
    :presence => true,
    :uniqueness => true,
    :length => { :maximum => 10}

end

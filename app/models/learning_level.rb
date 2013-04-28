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

  def self.select_max_level
    self.maximum(:level)
  end

end

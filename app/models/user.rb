class User < ActiveRecord::Base
  
  has_many :words
  
  def self.authenticate(username, password)
    where(:username => username, :password => Digest::SHA1.hexdigest(password)).first
  end

  def self.create_with_omniauth(auth)
    created_user = create!do |user|
      user.provider = auth["provider"]
      user.uid = auth["uid"]

      if user.provider == "facebook"
        user.name = auth["info"]["name"]
      else
        user.name = auth["info"]["nickname"]
      end
    end

    Word.create_tutorial_word(created_user.id)

    return created_user
  end
end

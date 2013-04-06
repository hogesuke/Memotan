
class LoginFilter
  
  def before(c)
    if c.session[:usr] then
      
      begin
        @usr = User.find(c.session[:usr])
      rescue ActiveRecord::RecordNotFound
        c.reset_session
      end
    end
    
    unless @usr
      
      c.flash[:referer] = c.request.fullpath
      c.redirect_to :controller => "login", :acion => "index"
    end
  end
end
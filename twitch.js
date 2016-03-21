(function() {

  var twitch = {
    streamers: ["freecodecamp", "storbeck", "sxswgamingesports", "habathcx", "noobs2ninjas", "RobotCaleb", "comster404"],
    channels: [],
    init: function() {
      this.cacheDom();
      this.getChannelInfoStreamTwitchApi();
      this.bindEvents();
    },
    cacheDom: function() {
      this.$el = $(".container-fluid");
      this.$buttonStart = this.$el.find("#button-start");
      this.$buttonsStatus = this.$el.find(".btn-status");
      this.$btnAll = this.$el.find("#btn-all");
      this.$btnOnline = this.$el.find("#btn-online");
      this.$btnOffline = this.$el.find("#btn-offline");
    },
    bindEvents: function() {
      this.$buttonStart.on("click", this.render.bind(this));
      this.$btnAll.on("click", this.showAll.bind(this));
      this.$btnOnline.on("click", this.hiddenOffline.bind(this));
      this.$btnOffline.on("click", this.hiddenOnline.bind(this));
    },
    render: function() {
      this.$buttonStart.remove();
      this.$buttonsStatus.css("display", "inline");
      this.channels.forEach(function(channel) {
        this.$el.append(
          $("<div/>")
            .attr("class", "row " + ((channel.status === 'Offline' || channel.name === 'Channel cancelled') ? 'offline' : 'online'))
            .append(
              $("<div/>")
                .attr("class", "channel")
                .append(
                  $("<div/>")
                    .attr("class", "channel-logo col-md-4 col-md-offset-4")
                    .append(
                      $("<a/>")
                        .attr("href", channel.url)
                        .attr("target", "_blank")
                        .append(
                          $("<img>")
                            .attr("class", "img-responsive img-circle")
                            .attr("src", channel.logo)  
                        )  
                    ),
                  $("<div/>")
                    .attr("class", "channel-info col-md-4 col-md-offset-8")
                    .append(
                      $("<a/>")
                        .attr("href", channel.url)
                        .attr("target", "_blank")
                        .append(
                          $("<p/>")
                            .text(channel.name),
                          $("<p/>")
                            .text("Watch now: " + channel.status)
                            .append(
                              $("<i/>")
                                .attr("class", ((channel.status === 'Offline' || channel.name === 'Channel cancelled') ? 'fa fa-exclamation' : 'fa fa-check') + " pull-right")
                            )
                        )
                    )  
                )
            )    
        );
      }, this);      
    },
    showAll: function() {
      this.$buttonsStatus.removeClass("clicked");
      this.$btnAll.addClass("clicked");
      var $visible = this.$el.find(".row");
      $visible.addClass("visible");
      $visible.removeClass("not-visible");
    },
    hiddenOnline: function() {
      this.$buttonsStatus.removeClass("clicked");
      this.$btnOffline.addClass("clicked");
      var $hidden = this.$el.find(".online");
      var $show = this.$el.find(".offline");
      $hidden.removeClass("visible");
      $hidden.addClass("not-visible");
      $show.removeClass("not-visible");
      $show.addClass("visible");
    },
    hiddenOffline: function() {
      this.$buttonsStatus.removeClass("clicked");
      this.$btnOnline.addClass("clicked");
      var $hidden = this.$el.find(".offline");
      var $show = this.$el.find(".online");
      $hidden.removeClass("visible");
      $hidden.addClass("not-visible");
      $show.removeClass("not-visible");
      $show.addClass("visible");
    },
    setTwitchChannelInfo: function(json) {
      if(json.status === 404 || json.status === 422) {
        var channel = {
        name:   "Channel cancelled",
        logo:   "http://cumbrianrun.co.uk/wp-content/uploads/2014/02/default-placeholder.png",
        url:    "#",
        status: json.message
        }
      } else {
        var channel = {
          name:   json.name,
          logo:   json.logo,
          url:    json.url,
          status: "Offline"
        }
       }  
      this.channels.push(channel);
    },
    setTwitchStreamStatusChannel: function(json) {
      var name = (json.status === 404 || json.status === 422) ? " " : json._links.channel.split("/channels/")[1];
      var status = (json.stream === null || json.status === 404 || json.status === 422) ? "Offline" : json.stream.channel.status;
      
      if(name !== " ") {
        this.channels.find(function(channel) {return channel.name === name.toLowerCase()}).status = status;
      }
    },
    getChannelInfoStreamTwitchApi: function() {      
      this.streamers.forEach(function(streamer) {
        $.ajax({
          type: "GET",
          url: "https://api.twitch.tv/kraken/channels/" + streamer + "?",
          contentType: "application/json; charset=utf-8",
          async: false,
          dataType: "jsonp",
          success: getChannelInfoJSON,
          error: function(errorMessage) {
          }
        }).done(function() {
          $.ajax({
            type: "GET",
            url: "https://api.twitch.tv/kraken/streams/" + streamer + "?",
            contentType: "application/json; charset=utf-8",
            async: false,
            dataType: "jsonp",
            success: getChannelStreamJSON,
            error: function(errorMessage) {
            }
          });
        });
      });
    }
  };
  
  function getChannelInfoJSON(json) {
    twitch.setTwitchChannelInfo(json);
  }

  function getChannelStreamJSON(json) {
    twitch.setTwitchStreamStatusChannel(json);
  }

  twitch.init();

})()
'use strict';

/**
 * Taken from the "Definitions" page at the end of the TS3 Server Query Documentation:
 * http://media.teamspeak.com/ts3_literature/TeamSpeak%203%20Server%20Query%20Manual.pdf
 */

module.exports = {
  HostMessageMode: {
    HostMessageMode_LOG: 1,       // 1: display message in chatlog
    HostMessageMode_MODAL: 2,     // 2: display message in modal dialog
    HostMessageMode_MODALQUIT: 3  // 3: display message in modal dialog and close connection
  },

  HostBannerMode: {
    HostMessageMode_NOADJUST: 0,     // 0: do not adjust
    HostMessageMode_IGNOREASPECT: 1, // 1: adjust but ignore aspect ratio (like TeamSpeak 2)
    HostMessageMode_KEEPASPECT: 2    // 2: adjust and keep aspect ratio
  },
  
  Codec: {
    CODEC_SPEEX_NARROWBAND: 0,     // 0: speex narrowband (mono, 16bit, 8kHz)
    CODEC_SPEEX_WIDEBAND: 1,       // 1: speex wideband (mono, 16bit, 16kHz)
    CODEC_SPEEX_ULTRAWIDEBAND: 2,  // 2: speex ultra-wideband (mono, 16bit, 32kHz)
    CODEC_CELT_MONO: 3             // 3: celt mono (mono, 16bit, 48kHz)
  },
  
  CodecEncryptionMode: {
    CODEC_CRYPT_INDIVIDUAL: 0, // 0: configure per channel
    CODEC_CRYPT_DISABLED: 1,   // 1: globally disabled
    CODEC_CRYPT_ENABLED: 2     // 2: globally enabled
  },
  
  TextMessageTargetMode: {
    /** !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
     * THIS HAS BEEN ADDED FOR cmr1-ts3-bot!
     * 
     * "TextMessageTarget_GLOBAL" IS NOT EXIST AN OFFICIAL TextMessageTarget
     * !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */
    TextMessageTarget_GLOBAL: 0,   // 0: target is all (available) text chats
    /** !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! */


    TextMessageTarget_CLIENT: 1,   // 1: target is a client
    TextMessageTarget_CHANNEL: 2,  // 2: target is a channel
    TextMessageTarget_SERVER: 3    // 3: target is a virtual server
  },
  
  LogLevel: {
    LogLevel_ERROR: 1,   // 1: everything that is really bad
    LogLevel_WARNING: 2, // 2: everything that might be bad
    LogLevel_DEBUG: 3,   // 3: output that might help find a problem
    LogLevel_INFO: 4     // 4: informational output
  },
  
  ReasonIdentifier: {
    REASON_KICK_CHANNEL: 4,  // 4: kick client from channel
    REASON_KICK_SERVER: 5    // 5: kick client from server
  },
  
  PermissionGroupDatabaseTypes: {
    PermGroupDBTypeTemplate: 0,  // 0: template group (used for new virtual servers)
    PermGroupDBTypeRegular: 1,   // 1: regular group (used for regular clients)
    PermGroupDBTypeQuery: 2      // 2: global query group (used for ServerQuery clients)
  },
  
  PermissionGroupTypes: {
    PermGroupTypeServerGroup: 0,   // 0: server group permission
    PermGroupTypeGlobalClient: 1,  // 1: client specific permission
    PermGroupTypeChannel: 2,       // 2: channel specific permission
    PermGroupTypeChannelGroup: 3,  // 3: channel group permission
    PermGroupTypeChannelClient: 4  // 4: channel-client specific permission
  },
  
  TokenType: {
    TokenServerGroup: 0,   // 0: server group token (id1={groupID} id2=0)
    TokenChannelGroup: 1   // 1: channel group token (id1={groupID} id2={channelID})
  }
};
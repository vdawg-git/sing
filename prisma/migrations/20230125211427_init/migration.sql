-- CreateTable
CREATE TABLE "Track" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT,
    "filepath" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "albumartist" TEXT,
    "albumID" INTEGER NOT NULL,
    "album" TEXT NOT NULL,
    "cover" TEXT,
    "playCount" INTEGER DEFAULT 0,
    "skipCount" INTEGER DEFAULT 0,
    "trackNo" INTEGER,
    "trackOf" INTEGER,
    "diskNo" INTEGER,
    "diskOf" INTEGER,
    "year" INTEGER,
    "date" TEXT,
    "originaldate" TEXT,
    "originalyear" INTEGER,
    "comment" TEXT,
    "genre" TEXT,
    "composer" TEXT,
    "lyrics" TEXT,
    "albumsort" TEXT,
    "titlesort" TEXT,
    "work" TEXT,
    "artistsort" TEXT,
    "albumartistsort" TEXT,
    "composersort" TEXT,
    "lyricist" TEXT,
    "writer" TEXT,
    "conductor" TEXT,
    "remixer" TEXT,
    "arranger" TEXT,
    "engineer" TEXT,
    "producer" TEXT,
    "djmixer" TEXT,
    "mixer" TEXT,
    "technician" TEXT,
    "label" TEXT,
    "grouping" TEXT,
    "subtitle" TEXT,
    "description" TEXT,
    "longDescription" TEXT,
    "discsubtitle" TEXT,
    "totaltracks" TEXT,
    "totaldiscs" TEXT,
    "movementTotal" INTEGER,
    "compilation" BOOLEAN,
    "bpm" REAL,
    "mood" TEXT,
    "media" TEXT,
    "catalognumber" TEXT,
    "podcast" BOOLEAN,
    "podcasturl" TEXT,
    "releasestatus" TEXT,
    "releasetype" TEXT,
    "releasecountry" TEXT,
    "script" TEXT,
    "language" TEXT,
    "copyright" TEXT,
    "license" TEXT,
    "encodedby" TEXT,
    "encodersettings" TEXT,
    "gapless" BOOLEAN,
    "barcode" TEXT,
    "isrc" TEXT,
    "asin" TEXT,
    "musicbrainz_recordingid" TEXT,
    "musicbrainz_trackid" TEXT,
    "musicbrainz_albumid" TEXT,
    "musicbrainz_artistid" TEXT,
    "musicbrainz_albumartistid" TEXT,
    "musicbrainz_releasegroupid" TEXT,
    "musicbrainz_workid" TEXT,
    "musicbrainz_trmid" TEXT,
    "musicbrainz_discid" TEXT,
    "acoustid_id" TEXT,
    "acoustid_fingerprint" TEXT,
    "musicip_puid" TEXT,
    "musicip_fingerprint" TEXT,
    "website" TEXT,
    "performerInstrument" TEXT,
    "averageLevel" INTEGER,
    "peakLevel" INTEGER,
    "notes" TEXT,
    "originalalbum" TEXT,
    "originalartist" TEXT,
    "discogs_artist_id" TEXT,
    "discogs_release_id" INTEGER,
    "discogs_label_id" INTEGER,
    "discogs_master_release_id" INTEGER,
    "discogs_votes" INTEGER,
    "discogs_rating" INTEGER,
    "replaygain_track_gain_ratio" INTEGER,
    "replaygain_track_peak_ratio" INTEGER,
    "replaygain_track_gain" TEXT,
    "replaygain_track_peak" TEXT,
    "replaygain_album_gain" TEXT,
    "replaygain_album_peak" TEXT,
    "replaygainUndoLeftChannel" INTEGER,
    "replaygainUndoRightChannel" INTEGER,
    "replaygain_track_minmax" TEXT,
    "key" TEXT,
    "category" TEXT,
    "keywords" TEXT,
    "movement" TEXT,
    "movementIndexNo" INTEGER,
    "movementIndexOf" INTEGER,
    "podcastId" TEXT,
    "showMovement" BOOLEAN,
    "stik" INTEGER,
    "container" TEXT,
    "tagTypes" TEXT,
    "duration" REAL,
    "bitrate" REAL,
    "sampleRate" INTEGER,
    "bitsPerSample" INTEGER,
    "tool" TEXT,
    "codec" TEXT,
    "codecProfile" TEXT,
    "lossless" BOOLEAN,
    "numberOfChannels" INTEGER,
    "numberOfSamples" INTEGER,
    "audioMD5" TEXT,
    "chapters" TEXT,
    "creationTime" TEXT,
    "modificationTime" TEXT,
    "trackGain" REAL,
    "trackPeakLevel" REAL,
    "albumGain" REAL,
    "type" TEXT NOT NULL DEFAULT 'track',
    CONSTRAINT "Track_artist_fkey" FOREIGN KEY ("artist") REFERENCES "Artist" ("name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Track_albumartist_fkey" FOREIGN KEY ("albumartist") REFERENCES "Artist" ("name") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Track_albumID_album_fkey" FOREIGN KEY ("albumID", "album") REFERENCES "Album" ("id", "name") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Track_cover_fkey" FOREIGN KEY ("cover") REFERENCES "Cover" ("filepath") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Album" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "artist" TEXT NOT NULL,
    "cover" TEXT,
    "type" TEXT NOT NULL DEFAULT 'album',
    CONSTRAINT "Album_artist_fkey" FOREIGN KEY ("artist") REFERENCES "Artist" ("name") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Album_cover_fkey" FOREIGN KEY ("cover") REFERENCES "Cover" ("filepath") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Artist" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "image" TEXT,
    "type" TEXT NOT NULL DEFAULT 'artist'
);

-- CreateTable
CREATE TABLE "Cover" (
    "md5" TEXT NOT NULL PRIMARY KEY,
    "filepath" TEXT NOT NULL,
    "isManuallyAdded" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT 'cover'
);

-- CreateTable
CREATE TABLE "Playlist" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'playlist'
);

-- CreateTable
CREATE TABLE "PlaylistItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "index" INTEGER NOT NULL,
    "trackID" INTEGER NOT NULL,
    "playlistID" INTEGER NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'playlistItem',
    CONSTRAINT "PlaylistItem_trackID_fkey" FOREIGN KEY ("trackID") REFERENCES "Track" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PlaylistItem_playlistID_fkey" FOREIGN KEY ("playlistID") REFERENCES "Playlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_CoverToPlaylist" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_CoverToPlaylist_A_fkey" FOREIGN KEY ("A") REFERENCES "Cover" ("md5") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_CoverToPlaylist_B_fkey" FOREIGN KEY ("B") REFERENCES "Playlist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Track_filepath_key" ON "Track"("filepath");

-- CreateIndex
CREATE UNIQUE INDEX "Album_name_artist_key" ON "Album"("name", "artist");

-- CreateIndex
CREATE UNIQUE INDEX "Album_name_id_key" ON "Album"("name", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Cover_filepath_key" ON "Cover"("filepath");

-- CreateIndex
CREATE UNIQUE INDEX "_CoverToPlaylist_AB_unique" ON "_CoverToPlaylist"("A", "B");

-- CreateIndex
CREATE INDEX "_CoverToPlaylist_B_index" ON "_CoverToPlaylist"("B");

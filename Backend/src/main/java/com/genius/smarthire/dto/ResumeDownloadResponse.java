package com.genius.smarthire.dto;

public class ResumeDownloadResponse {

    private final String url;
    private final long expiresAt;

    public ResumeDownloadResponse(
            String url,
            long expiresAt
    ) {
        this.url = url;
        this.expiresAt = expiresAt;
    }

    public String getUrl() {
        return url;
    }

    public long getExpiresAt() {
        return expiresAt;
    }
}
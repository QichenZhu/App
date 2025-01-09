import {act, render, screen} from '@testing-library/react';
import type {AVPlaybackStatusSuccess} from 'expo-av';
import React, {useContext} from 'react';
import type {VideoPlayerProps, VideoWithOnFullScreenUpdate} from '@components/VideoPlayer/types';
import type {PlaybackContext} from '@components/VideoPlayerContexts/types';
import {VideoPopoverMenuContextProvider} from '@components/VideoPlayerContexts/VideoPopoverMenuContext';
import VideoPlayer from '@src/components/VideoPlayer';

const MockFullScreenContext = React.createContext({
    isFullScreenRef: {current: false},
});
function mockUseFullScreenContext() {
    return useContext(MockFullScreenContext);
}
jest.mock('@components/VideoPlayerContexts/FullScreenContext', () => ({
    __esModule: true,
    useFullScreenContext: mockUseFullScreenContext,
}));

const MockPlaybackContext = React.createContext<PlaybackContext | null>(null);
function mockUsePlaybackContext() {
    return useContext(MockPlaybackContext);
}
jest.mock('@components/VideoPlayerContexts/PlaybackContext', () => ({
    __esModule: true,
    PlaybackContext: MockPlaybackContext,
    usePlaybackContext: mockUsePlaybackContext,
}));

jest.mock('@hooks/useWindowDimensions', () => ({
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@components/VideoPlayerContexts/VolumeContext', () => ({
    __esModule: true,
    useVolumeContext: jest.fn().mockReturnValue({
        lastNonZeroVolume: {
            get: jest.fn(),
        },
        updateVolume: jest.fn(),
    }),
}));

jest.mock('@components/VideoPlayer/VideoPlayerControls', () => ({
    __esModule: true,
    default: jest.fn(),
}));

describe('VideoPlayer Component', () => {
    const URL = 'https://example.com/video.mp4';
    const DEFAULT_PROPS: VideoPlayerProps = {
        url: URL,
        onVideoLoaded: () => {},
        shouldPlay: true,
        isLooping: false,
        shouldUseSharedVideoElement: true,
    };
    const DEFAULT_STATUS = {
        didJustFinish: false,
        durationMillis: 1,
        isLoaded: true,
        isLooping: false,
        isPlaying: true,
    } as AVPlaybackStatusSuccess;
    const SHARD_ELEMENT = 'SharedElement';

    const currentVideoPlayer = {
        getStatusAsync: jest.fn().mockResolvedValue({...DEFAULT_STATUS}),
        setStatusAsync: jest.fn(),
        _onPlaybackStatusUpdate: jest.fn(),
    } as unknown as VideoWithOnFullScreenUpdate;

    const originalParent = document.createElement('div');
    const sharedElement = document.createElement('div');
    sharedElement.dataset.testid = SHARD_ELEMENT;
    const playbackContext: PlaybackContext = {
        updateCurrentlyPlayingURL: jest.fn(),
        currentlyPlayingURL: URL,
        currentlyPlayingURLReportID: '',
        originalParent,
        sharedElement,
        currentVideoPlayerRef: {current: currentVideoPlayer},
        shareVideoPlayerElements: jest.fn(),
        setCurrentlyPlayingURL: jest.fn(),
        playVideo: jest.fn(),
        pauseVideo: jest.fn(),
        checkVideoPlaying: jest.fn(),
        videoResumeTryNumberRef: {current: 0},
    };

    const isFullScreenRef = {current: false};

    const renderVideoPlayer = (props = DEFAULT_PROPS) => {
        render(
            <MockPlaybackContext.Provider value={playbackContext}>
                <MockFullScreenContext.Provider value={{isFullScreenRef}}>
                    <VideoPopoverMenuContextProvider>
                        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
                        <VideoPlayer {...props} />
                    </VideoPopoverMenuContextProvider>
                </MockFullScreenContext.Provider>
            </MockPlaybackContext.Provider>,
        );
    };

    it('should be visible after video ends in fullscreen mode', () => {
        renderVideoPlayer();
        isFullScreenRef.current = true;
        act(() =>
            currentVideoPlayer._onPlaybackStatusUpdate?.({
                ...DEFAULT_STATUS,
                didJustFinish: true,
                isPlaying: false,
            }),
        );
        expect(screen.queryByTestId(SHARD_ELEMENT)).toBeTruthy();
    });
});

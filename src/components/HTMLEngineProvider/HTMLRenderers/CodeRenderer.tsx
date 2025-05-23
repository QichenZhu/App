import React from 'react';
import {splitBoxModelStyle} from 'react-native-render-html';
import type {CustomRendererProps, TPhrasing, TText} from 'react-native-render-html';
import * as HTMLEngineUtils from '@components/HTMLEngineProvider/htmlEngineUtils';
import InlineCodeBlock from '@components/InlineCodeBlock';
import useStyleUtils from '@hooks/useStyleUtils';
import FontUtils from '@styles/utils/FontUtils';

type CodeRendererProps = CustomRendererProps<TText | TPhrasing> & {
    /** Key of the element */
    key?: string;
};

function CodeRenderer({TDefaultRenderer, key, style, ...defaultRendererProps}: CodeRendererProps) {
    const StyleUtils = useStyleUtils();
    // We split wrapper and inner styles
    // "boxModelStyle" corresponds to border, margin, padding and backgroundColor
    const {boxModelStyle, otherStyle: textStyle} = splitBoxModelStyle(style ?? {});

    /** Get the default fontFamily variant */
    const font = FontUtils.fontFamily.platform.MONOSPACE.fontFamily;

    // Determine the font size for the code based on whether it's inside an H1 element.
    const isInsideH1 = HTMLEngineUtils.isChildOfH1(defaultRendererProps.tnode);
    const isInsideTaskTitle = HTMLEngineUtils.isChildOfTaskTitle(defaultRendererProps.tnode);

    const fontSize = StyleUtils.getCodeFontSize(isInsideH1, isInsideTaskTitle);

    const textStyleOverride = {
        fontSize,
        fontFamily: font,
    };

    return (
        <InlineCodeBlock
            defaultRendererProps={{...defaultRendererProps, style: {}}}
            TDefaultRenderer={TDefaultRenderer}
            boxModelStyle={boxModelStyle}
            textStyle={{...textStyle, ...textStyleOverride}}
            key={key}
        />
    );
}

CodeRenderer.displayName = 'CodeRenderer';

export default CodeRenderer;

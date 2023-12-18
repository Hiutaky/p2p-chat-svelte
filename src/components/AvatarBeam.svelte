<script>
    import { hashCode, getUnit, getBoolean, getRandomColor, getContrast } from '$lib/utilities';

    export let size = 32;
    export let name = 'some name here'
    export const props = {
        colors: ['#92A1C6', '#146A7C', '#F0AB3D', '#C271B4', '#C20D90'],
        square: false,
        size: size,
    }
    function generateData(name, colors) {
        const numFromName = hashCode(name);
        const range = colors && colors.length;
        const wrapperColor = getRandomColor(numFromName, colors, range);
        const preTranslateX = getUnit(numFromName, 10, 1);
        const wrapperTranslateX = preTranslateX < 5 ? preTranslateX + size / 9 : preTranslateX;
        const preTranslateY = getUnit(numFromName, 10, 2);
        const wrapperTranslateY = preTranslateY < 5 ? preTranslateY + size / 9 : preTranslateY;

        const data = {
            wrapperColor: wrapperColor,
            faceColor: getContrast(wrapperColor),
            backgroundColor: getRandomColor(numFromName + 13, colors, range),
            wrapperTranslateX: wrapperTranslateX,
            wrapperTranslateY: wrapperTranslateY,
            wrapperRotate: getUnit(numFromName, 360),
            wrapperScale: 1 + getUnit(numFromName, size / 12) / 10,
            isMouthOpen: getBoolean(numFromName, 2),
            isCircle: getBoolean(numFromName, 1),
            eyeSpread: getUnit(numFromName, 5),
            mouthSpread: getUnit(numFromName, 3),
            faceRotate: getUnit(numFromName, 10, 3),
            faceTranslateX:
            wrapperTranslateX > size / 6 ? wrapperTranslateX / 2 : getUnit(numFromName, 8, 1),
            faceTranslateY:
            wrapperTranslateY > size / 6 ? wrapperTranslateY / 2 : getUnit(numFromName, 7, 2),
        };

        return data;
    }

    $: data = generateData(name, props.colors);
    const maskID = Math.floor( Math.random() * 1000 )
</script>
<svg
    viewBox={'0 0 ' + size + ' ' + size}
    fill="none"
    role="img"
    xmlns="http://www.w3.org/2000/svg"
    width={props.size}
    height={props.size}
>
    <mask id={maskID} maskUnits="userSpaceOnUse" x={0} y={0} width={size} height={size}>
    <rect width={size} height={size} rx={props.square ? undefined : size * 2} fill="#FFFFFF" />
    </mask>
    <g mask={`url(#${maskID})`}>
    <rect width={size} height={size} fill={data.backgroundColor} />
    <rect
        x="0"
        y="0"
        width={size}
        height={size}
        transform={
        'translate(' +
        data.wrapperTranslateX +
        ' ' +
        data.wrapperTranslateY +
        ') rotate(' +
        data.wrapperRotate +
        ' ' +
        size / 2 +
        ' ' +
        size / 2 +
        ') scale(' +
        data.wrapperScale +
        ')'
        }
        fill={data.wrapperColor}
        rx={data.isCircle ? size : size / 6}
    />
    <g
        transform={
        'translate(' +
        data.faceTranslateX +
        ' ' +
        data.faceTranslateY +
        ') rotate(' +
        data.faceRotate +
        ' ' +
        size / 2 +
        ' ' +
        size / 2 +
        ')'
        }
    >
        {#if data.isMouthOpen}
        <path
            d={'M15 ' + (19 + data.mouthSpread) + 'c2 1 4 1 6 0'}
            stroke={data.faceColor}
            fill="none"
            strokeLinecap="round"
        />
        {:else}
        <path
            d={'M13,' + (19 + data.mouthSpread) + ' a1,0.75 0 0,0 10,0'}
            fill={data.faceColor}
        />
        {/if}
        <rect
        x={14 - data.eyeSpread}
        y={14}
        width={1.5}
        height={2}
        rx={1}
        stroke="none"
        fill={data.faceColor}
        />
        <rect
        x={20 + data.eyeSpread}
        y={14}
        width={1.5}
        height={2}
        rx={1}
        stroke="none"
        fill={data.faceColor}
        />
    </g>
    </g>
</svg>
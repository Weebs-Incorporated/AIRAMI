const DimensionsLabel = ({ dimensions: { height, width } }: { dimensions: { height: number; width: number } }) => {
    return (
        <span
            style={{
                position: 'absolute',
                top: 0,
                right: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
            }}
        >
            {height} x {width}
        </span>
    );
};

export default DimensionsLabel;

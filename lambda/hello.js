exports.main = async (event, context) => {
    console.log('Event:', JSON.stringify(event, null, 2));
    console.log('SPACE_TABLE_NAME:', process.env.SPACES_TABLE_NAME);
    return {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: 'SPACE_TABLE_NAME is ' + process.env.SPACES_TABLE_NAME,
            event: event
        }),
    };
};
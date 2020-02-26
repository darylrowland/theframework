const COLORS = {
    green: "rgba(176, 245, 102, 1.00)",
    blue: "rgba(92, 201, 245, 1.00)",
    overlay: "rgba(0,0,0,0.1)",
    light: "rgba(242, 242, 247, 1.00)",
    red: "rgba(255, 118, 110, 1.00)",
    white: "#ffffff"
};

export default {
    global: {
        methodIndicator: {
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 10,
            paddingRight: 10,
            fontSize: 15,
            fontWeight: "900",
            marginRight: 10,
            borderRadius: 4
        },
        typeIndicator: {
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 10,
            paddingRight: 10,
            fontSize: 13,
            fontWeight: "900",
            marginRight: 10,
            borderRadius: 4,
            backgroundColor: COLORS.light
        },
        requiredIndicator: {
            color: COLORS.white,
            paddingTop: 5,
            paddingBottom: 5,
            paddingLeft: 10,
            paddingRight: 10,
            fontSize: 13,
            fontWeight: "900",
            marginRight: 10,
            borderRadius: 4,
            backgroundColor: COLORS.red
        },
        methodIndicatorMethods: {
            GET: {
                backgroundColor: COLORS.green
            },
            POST: {
                backgroundColor: COLORS.blue
            }
        },
        modalOverlay: {
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: COLORS.overlay,
            alignItems: "center",
            justifyContent: "center",
            display: "flex"
        },
        modal: {
            position: "absolute",
            top: "10%",
            left: "10%",
            right: "10%",
            bottom: 0,
            backgroundColor: COLORS.white,
            borderTopLeftRadius: 10,
            borderTopRightRadius: 10,
            padding: 50
        },
        mainContainer: {
            display: "flex",
            justifyContent: "center",
            width: "100%"
        },
        mainInnerContainer: {
            paddingTop: 50,
            width: "90%",
            maxWidth: 1000,
            minWidth: 300
        }
    }
}